echo """
if [ -d \$WORKSPACE_PATH/.devcontainer/.bashrc.d ]; then
  for i in \$WORKSPACE_PATH/.devcontainer/.bashrc.d/*.sh; do
    if [ -r \$i ]; then
      . \$i
    fi
  done
  unset i
fi

""" >> ~/.bashrc

pre-commit install
