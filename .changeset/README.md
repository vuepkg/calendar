# Changesets

This directory is used by [changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Workflow

1. Make changes to a package
2. Run `pnpm changeset` to create a new changeset
3. Commit the changeset file along with your changes
4. On merge to main, run `pnpm changeset version` to bump versions and update changelogs
5. Run `pnpm changeset publish` to publish to npm
