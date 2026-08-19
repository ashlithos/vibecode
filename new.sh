#!/usr/bin/env sh
# Scaffold a new experiment folder from _template/.
# Usage: ./new.sh my-idea
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if [ $# -ne 1 ]; then
  echo "usage: $0 <slug>" >&2
  exit 2
fi

slug=$1
case $slug in
  *[!a-z0-9-]* | -* | *- | '')
    echo "slug must be lowercase letters, digits and dashes, e.g. tiny-raytracer" >&2
    exit 2
    ;;
esac

dir="$root/$(date +%Y-%m)-$slug"

if [ -e "$dir" ]; then
  echo "already exists: $dir" >&2
  exit 1
fi

cp -R "$root/_template" "$dir"

# Fill the placeholder heading so the folder isn't literally named "<name>".
sed "1s|.*|# $slug|" "$dir/README.md" > "$dir/README.md.tmp"
mv "$dir/README.md.tmp" "$dir/README.md"

echo "$dir"
echo "next: fill in 'Trying to:' in $(basename "$dir")/README.md, and add a row to the root README index."
