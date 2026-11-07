if [[ $- == *i* ]]; then
  HISTCONTROL=ignoreboth
  HISTSIZE=10000
  HISTFILESIZE=20000
  shopt -s histappend checkwinsize

  bind 'set completion-ignore-case on'
  bind 'set show-all-if-ambiguous on'
  bind '"\e[A": history-search-backward'
  bind '"\e[B": history-search-forward'
  bind '"\e[Z": menu-complete-backward'

  __cbdn_git_prompt() {
    local branch
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      if branch=$(git symbolic-ref --quiet --short HEAD); then
        printf ' (%s)' "$branch"
      else
        branch=$(git rev-parse --short HEAD) || return
        printf ' (detached:%s)' "$branch"
      fi
    fi
  }

  __cbdn_exit_status() {
    if (( $1 != 0 )); then
      printf '[exit %s] ' "$1"
    fi
  }

  if [[ ${TERM:-dumb} != dumb && ! ${NO_COLOR+x} ]]; then
    bind 'set colored-stats on'
    bind 'set colored-completion-prefix on'
    PS1='\n\[\e[1;31m\]$(__cbdn_exit_status "$?")\[\e[1;32m\]\u@\h\[\e[0m\] \[\e[1;34m\]\w\[\e[1;33m\]$(__cbdn_git_prompt)\[\e[0m\]\n\[\e[1;35m\]\$\[\e[0m\] '
  else
    bind 'set colored-stats off'
    bind 'set colored-completion-prefix off'
    PS1='\n$(__cbdn_exit_status "$?")\u@\h \w$(__cbdn_git_prompt)\n\$ '
  fi
fi
