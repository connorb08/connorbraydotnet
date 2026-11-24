if [[ $- == *i* && ${TERM:-dumb} != dumb && ! ${NO_COLOR+x} ]]; then
  if command -v eza >/dev/null 2>&1; then
    alias ls='eza --color=auto --group-directories-first'
    alias lt='eza --tree --level=2 --color=auto --group-directories-first'
  else
    alias ls='ls --color=auto --group-directories-first'
  fi
  alias grep='grep --color=auto'
fi
alias l='eza --color=auto --group-directories-first'
alias lt='eza --tree --level=2 --color=auto --group-directories-first'
alias ll='l -aal --classify=auto'
alias la='l -A'
alias l='ls -F'
