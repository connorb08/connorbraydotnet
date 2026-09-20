echo """
if [ -d ~/.bashrc.d ]; then
  for i in ~/.bashrc.d/*.sh; do
    if [ -r \$i ]; then
      . \$i
    fi
  done
  unset i
fi

""" >> ~/.bashrc

pre-commit install

# __scripts_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# __devcontainer_dir="$(dirname "$__scripts_dir")"
# __shell_dir="$__devcontainer_dir/.bashrc"
# echo "source $__shell_dir" >> ~/.bashrc
