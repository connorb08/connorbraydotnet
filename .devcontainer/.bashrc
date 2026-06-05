source $(dirname "${BASH_SOURCE[0]}")/.env

alias r="bun run"
alias tf="terraform"
alias n="bun nx run"
alias c="bun nx run"

alias web="python3 -m http.server"

alias nx="bun nx"

alias ll="ls -lah"
alias la="ls -A"

alias wrangler="bun run wrangler"

export ROOT=$(dirname "$(dirname "${BASH_SOURCE[0]}")")
export DATABASE_DIR=$ROOT/services/database
