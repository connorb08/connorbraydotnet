SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
BASHRC_PATH="$PARENT_DIR/.bashrc"
echo "source $BASHRC_PATH" >> ~/.bashrc

sudo chown -R vscode:vscode /home/vscode/.local

pre-commit install
