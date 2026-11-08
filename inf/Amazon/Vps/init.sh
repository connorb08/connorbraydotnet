#!/bin/bash

# ==============================================================================
# LIGHTSAIL USER DATA BOOTSTRAP SCRIPT (Amazon Linux)
# ==============================================================================
# Root privileges are granted automatically. Do not use 'sudo' inside this script.
# View logs live using: tail -f /var/log/user-data.log
# ==============================================================================

# Fail immediately if any command fails, and log every executed command
set -euo pipefail
set -x

# Redirect all stdout and stderr to a dedicated log file and syslog
exec > >(tee /var/log/user-data.log | logger -t user-data ) 2>&1

echo "Starting Lightsail system initialization..."

SSH_PORT="__SSH_PORT__"
if [[ ! "$SSH_PORT" =~ ^[0-9]+$ ]] || (( SSH_PORT < 1024 || SSH_PORT > 65535 )); then
    echo "SSH_PORT must be injected by Pulumi as an integer between 1024 and 65535." >&2
    exit 1
fi

# 1. Update system packages
echo "Updating package repositories..."
dnf update -y

# 2. Install core tools
echo "Installing core dependencies..."
dnf install -y git htop unzip sudo policycoreutils policycoreutils-python-utils

# 3. Verification
echo "System Verification:"
git --version

DEFAULT_USER="ec2-user"
LOGIN_USER="dev"
LOGIN_HOME="/home/$LOGIN_USER"
DEFAULT_KEYS="/home/$DEFAULT_USER/.ssh/authorized_keys"
LOGIN_KEYS="$LOGIN_HOME/.ssh/authorized_keys"

# 4. Set up the SSH user
if ! id "$LOGIN_USER" >/dev/null 2>&1; then
    useradd --create-home --home-dir "$LOGIN_HOME" "$LOGIN_USER"
fi
usermod -aG wheel "$LOGIN_USER"
LOGIN_GROUP="$(id -gn "$LOGIN_USER")"

install -d -m 700 -o "$LOGIN_USER" -g "$LOGIN_GROUP" "$LOGIN_HOME/.ssh"
if [ -s "$DEFAULT_KEYS" ]; then
    install -m 600 -o "$LOGIN_USER" -g "$LOGIN_GROUP" "$DEFAULT_KEYS" "$LOGIN_KEYS"
elif [ ! -s "$LOGIN_KEYS" ]; then
    echo "No SSH authorized keys found for $DEFAULT_USER or $LOGIN_USER." >&2
    exit 1
fi
chown "$LOGIN_USER:$LOGIN_GROUP" "$LOGIN_KEYS"
chmod 600 "$LOGIN_KEYS"
restorecon -RF "$LOGIN_HOME/.ssh"

# The SSH-only user has no password to authenticate with sudo.
printf '%s ALL=(ALL) NOPASSWD: ALL\n' "$LOGIN_USER" > "/etc/sudoers.d/90-$LOGIN_USER"
chmod 440 "/etc/sudoers.d/90-$LOGIN_USER"
visudo -c

# 5. Configure SSH on the injected port only
if selinuxenabled; then
    if ! semanage port -l | awk -v port="$SSH_PORT" '
        $1 == "ssh_port_t" && $2 == "tcp" {
            for (i = 3; i <= NF; i++) {
                gsub(/,/, "", $i)
                split($i, range, "-")
                if (port >= range[1] && port <= (range[2] ? range[2] : range[1]))
                    found = 1
            }
        }
        END { exit !found }
    '; then
        semanage port -a -t ssh_port_t -p tcp "$SSH_PORT"
    fi
else
    echo "SELinux is disabled; no SSH port label is required."
fi

install -d -m 755 /etc/ssh/sshd_config.d
printf 'Port %s\n' "$SSH_PORT" > /etc/ssh/sshd_config.d/00-vps-port.conf
chmod 644 /etc/ssh/sshd_config.d/00-vps-port.conf
sshd -t
if [ "$(sshd -T | awk '$1 == "port" { print $2 }')" != "$SSH_PORT" ]; then
    echo "SSH configuration must listen only on port $SSH_PORT; check other Port directives." >&2
    exit 1
fi
systemctl restart sshd
if [ -z "$(ss -H -ltn "sport = :$SSH_PORT")" ]; then
    echo "SSH is not listening on port $SSH_PORT after restart." >&2
    exit 1
fi

# 6. Revoke the default user's password and this SSH key file
passwd -l "$DEFAULT_USER"
rm -f "$DEFAULT_KEYS"

echo "=============================================================================="
echo "Lightsail Initialization Completed Successfully!"
echo "=============================================================================="
