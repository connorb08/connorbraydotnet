alias ..='cd ..'
alias ...='cd ../..'
alias inf="pulumi"

bws() {
  BWS_ACCESS_TOKEN=$(source .devcontainer/.env 2>/dev/null; printf '%s' "${BWS_ACCESS_TOKEN:-}") command bws "$@"
}
