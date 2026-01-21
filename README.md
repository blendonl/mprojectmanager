# mprojectmanager monorepo

This repository is organized as a monorepo with three apps under `apps/`.

## Layout

- `apps/backend` - Backend service (placeholder; to be added).
- `apps/tui` - Go-based terminal UI application.
- `apps/mobile` - React Native / Expo mobile app.

## Working locally

This repo uses Turborepo for task orchestration.

Common root scripts:

- `yarn build` - Build all apps that define a `build` script.
- `yarn dev` - Run `dev` tasks (if defined) in each app.
- `yarn test` - Run tests across apps.
- `yarn lint` - Run linters across apps.

Each app still manages its own dependencies and tooling. Change into the app
directory to build, test, or run it directly when needed.
