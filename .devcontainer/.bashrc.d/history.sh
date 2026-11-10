export HISTFILE=/commandhistory/.bash_history
export HISTSIZE=500000
export HISTFILESIZE=10000000
export HISTCONTROL=erasedups:ignorespace
export HISTIGNORE="ls:ll:la:cd:pwd:exit:date:clear:history"
export HISTTIMEFORMAT="%F %T "
shopt -s cmdhist
shopt -s histappend
export -n PROMPT_COMMAND
PROMPT_COMMAND="history -a; history -c; history -r; $PROMPT_COMMAND"
