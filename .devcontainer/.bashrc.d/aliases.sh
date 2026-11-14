DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -d "$DIR/aliases.d" ]; then
  for i in "$DIR/aliases.d"/*.sh; do
    if [ -r "$i" ]; then
      . $i
    fi
  done
  unset i
fi
