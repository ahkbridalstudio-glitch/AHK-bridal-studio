# AHK Bridal Studio

Pakistani bridal haute couture and custom atelier storefront with an admin dashboard backed by the existing Express API and MongoDB models.

## Run locally

Requirements: Node.js 20.19 or later and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The frontend calls the backend at the URL configured by `VITE_API_BASE_URL` in `.env` (defaults to `/api` in source). MongoDB is configured by `MONGODB_URI` in `.env`. Keep `.env` private; it is excluded from version control.

The provided MongoDB connection is configured in the local `.env` file and targets the `ahk_bridal_studio` database. For another environment, set `MONGODB_URI` and `VITE_API_BASE_URL` in its environment variables; never commit credentials.

## Other commands

- `npm run build` builds the frontend into `dist/`.
- `npm run preview` previews the built frontend.
- `npm run lint` runs the TypeScript compiler without emitting files.
