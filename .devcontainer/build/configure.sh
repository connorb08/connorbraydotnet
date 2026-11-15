#!/bin/sh

cat <<'EOF' >> /etc/bash.bashrc
export USER=$(whoami)

source /etc/bash_completion

if [ -d /etc/bash.bashrc.d ]; then
  for i in /etc/bash.bashrc.d/*.sh; do
    if [ -r "$i" ]; then
      . $i
    fi
  done
  unset i
fi
EOF

# Configure locale to en_US.UTF-8
mkdir -p /etc/bash.bashrc.d
echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
echo "export LANG='en_US.UTF-8'" >> /etc/bash.bashrc.d/locale.sh
