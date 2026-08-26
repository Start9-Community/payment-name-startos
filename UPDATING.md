# Updating the upstream version

Payment Name has no external upstream project — the service _is_ this repository. There is no
`dockerTag` to bump: the runtime image is built locally from the `Dockerfile` via `dockerBuild`
in `startos/manifest/index.ts`, and it exists only to give the daemon a container to run in.

Three things here do track something outside the repo.

## Determining the upstream version

- **`@start9labs/start-sdk`** — the packaging SDK, pinned in `package.json`:

  ```sh
  npm view @start9labs/start-sdk version
  ```

- **`nostr-tools`** — supplies NIP-98 request signing for hosted names:

  ```sh
  npm view nostr-tools version
  ```

- **Debian base image** — the `FROM` line in `Dockerfile`. Nothing in the container executes, so
  this only needs to move when the tag stops receiving security updates:

  ```sh
  curl -fsSL "https://hub.docker.com/v2/repositories/library/debian/tags?page_size=50&ordering=last_updated" \
    | jq -r '.results[].name' | grep -E '^[a-z]+-slim$'
  ```

## Applying the bump

1. Edit the pin — `package.json` for either npm dependency (then `npm install` to refresh
   `package-lock.json`), or the `FROM` line in `Dockerfile` for the base image.
2. Bump the packaging revision in `startos/versions/current.ts` and write `releaseNotes` for every
   locale.
3. `npx tsc --noEmit`, then `make x86` and install on a dev box before opening the PR.
