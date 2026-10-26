# BrickWealth Frontend

BrickWealth is a React and Vite frontend for portfolio and asset management.

## Requirements

- Node.js
- pnpm

Install dependencies and start the development server:

```sh
pnpm install
pnpm dev
```

The app is served at `http://localhost:8080`.

## Backend API

This repository contains the frontend only. The Express API must be run separately. The frontend
uses `VITE_BACKEND_URL` as its base URL and defaults to `http://localhost:3000`; API requests are
sent to its `/api` path. Set the variable in a local `.env` file when the API runs elsewhere:

```dotenv
VITE_BACKEND_URL=http://localhost:3000
```

Only public client configuration belongs in `VITE_*` variables. Do not put server credentials in
frontend environment variables.

## Checks

```sh
pnpm lint
pnpm format:check
pnpm exec tsc --noEmit -p tsconfig.app.json
pnpm build
```

There is currently no test script or test suite configured in this repository.
