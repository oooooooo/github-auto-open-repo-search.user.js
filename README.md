# GitHub Auto Open Repo Search

A userscript that opens the "Top repositories" search on the GitHub dashboard
automatically, so you can type a repository name right away instead of
clicking the magnifier icon first.

## Install

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/).
2. Open [github-auto-open-repo-search.user.js](https://raw.githubusercontent.com/oooooooo/github-auto-open-repo-search.user.js/main/github-auto-open-repo-search.user.js)
   and confirm the installation.

## How it works

On `https://github.com/`, the script finds
the search button next to "Top repositories" and clicks it once per visit.
If you close the search, it stays closed until you navigate back to the
dashboard.

The script starts only when `https://github.com/` is loaded, so it does not
run when you reach the dashboard through an in-page link from another page.

## Development

```sh
pnpm install
pnpm test
pnpm lint
```
