# Meal Prep Generator API

Contains the API server and database for the Meal Prep Generator app.

## Development Setup

```bash
yarn install
yarn build
docker-compose up -d --build
```

This will build the API and install two database instances, one for development and one for testing:

- Testing: `postgresql://admin:dev@localhost:5433/mpg_test`
- Development: `postgresql://admin:dev@localhost:5432/mpg`

You also need to have the required environment variables set in `.env`. All of the environment is specified in `./src/config.ts`. For development, you can fill in `DATABASE_URL` with the development URL above. That needs to change in production.

Once they're ready, migrate our database stuff:

```bash
npx db-migrate up -e real

# Optional, if you want to update the test database
npx db-migrate up -e test
```

You can now run `yarn start` or `yarn debug`!

Happy Hacking!

## Teardown

When something seems fishy, bomb it:

`docker-compose down --rmi all`
