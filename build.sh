#!/usr/bin/env bash
# Build the .s9pk.
#
# start-cli insists on a "packaging workspace" in the package repo's PARENT
# directory, and populates it with a 74MB clone of the Start9 monorepo, a build
# key, and its own AGENTS.md/CLAUDE.md. None of that belongs in the bitsaga
# repo, and a stray CLAUDE.md under services/ would be read by unrelated agents.
# It also resolves symlinks, so linking the package into a workspace elsewhere
# does not work either.
#
# So: the source of truth stays here, and the build happens in a synced copy
# inside a build cache. The resulting .s9pk is copied back.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WS="${S9_WORKSPACE:-$HOME/.cache/s9-workspace}"
DST="$WS/payment-name-startos"
ARCHES="${1:-x86}"

command -v start-cli >/dev/null || export PATH="$HOME/.local/bin:$PATH"
command -v start-cli >/dev/null || {
  echo "start-cli not found. See https://docs.start9.com/packaging/environment-setup.html" >&2
  exit 1
}

mkdir -p "$WS"
if [ ! -d "$WS/start-technologies" ]; then
  echo "Initialising packaging workspace at $WS ..."
  (cd "$WS" && start-cli s9pk init-workspace . >/dev/null)
fi

# start-cli resolves the configured StartOS host at startup, even for offline
# commands like `pack` and `list-ingredients`, and hard-fails if the name does
# not resolve. The scaffolded default is dev-vm.local, which exists only if you
# actually have a dev box on the LAN. This is a build cache, so point it at
# something that always resolves; nothing is ever sent there.
if grep -q 'dev-vm.local' "$WS/.startos/config.yaml" 2>/dev/null; then
  sed -i 's|https://dev-vm.local|https://127.0.0.1|' "$WS/.startos/config.yaml"
fi

rm -rf "$DST"
mkdir -p "$DST"
rsync -a --exclude '.git' --exclude '.testdata' --exclude '*.s9pk' "$SRC/" "$DST/"

# Bundle first. `make` derives its ingredient list before it would build the
# bundle, so on a clean copy the pack step is asked for a javascript/index.js
# that does not exist yet.
(cd "$DST" && npm run build --silent >/dev/null)
echo "Building ($ARCHES) in $DST ..."
# start-cli shells out to `docker`, which needs root on this box. Rather than
# putting the build user in the docker group (which is equivalent to handing it
# root), run just the build under sudo and hand the artefacts back afterwards.
if docker ps >/dev/null 2>&1; then
  RUN=(env "PATH=$PATH")
else
  RUN=(sudo -E env "PATH=$PATH" "HOME=$HOME")
fi

# Hand the workspace back whatever happens. Without this a failed build leaves
# root-owned files and the next run cannot clear its own copy.
reclaim() { sudo -n chown -R "$(id -u):$(id -g)" "$DST" 2>/dev/null || true; }
trap reclaim EXIT INT TERM

# make evaluates the ingredient list before it rebuilds the bundle, so a
# manifest change needs two passes to be seen.
(cd "$DST" && "${RUN[@]}" make "$ARCHES" >/dev/null 2>&1 || true)
(cd "$DST" && "${RUN[@]}" make "$ARCHES")

shopt -s nullglob
built=("$DST"/*.s9pk)
if [ ${#built[@]} -eq 0 ]; then
  echo "No .s9pk produced" >&2
  exit 1
fi
cp "${built[@]}" "$SRC/"
cd "$SRC"
for f in "${built[@]}"; do
  printf '%s  %s\n' "$(sha256sum "$(basename "$f")" | cut -d' ' -f1)" "$(basename "$f")"
done
