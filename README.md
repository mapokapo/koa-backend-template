# Koa Backend Template

> A starting point for my personal Koa backends.

## About The Project

This repo contains a template for my personal Koa backends. It features:

- An **extensible** and **modular** architecture for defining your own global
  state, 3rd party connections, custom scripts, etc.
- Compile-time type safety with **Typescript** and **runtime type checking**
  with **Zod**
- A simple way to define **routes** and **middleware**
- A secure and simple **authentication system** using **Firebase Auth**
- A dead-simple but pretty **logger**
- Sample **Prisma models** and routes to get started
- Testing with **Jest** and **Supertest** is set up
- **Bootstrap scripts** for building and running the project
- **Prettier** and **ESLint** configured

### Built with

#### Core

- [Koa](https://koajs.com/)
- [Prisma](https://www.prisma.io/)
- [Typescript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/)

#### Testing

- [Jest](https://jestjs.io/)
- [Supertest](https://github.com/ladjs/supertest)

#### Dev tools

- [Ora](https://github.com/sindresorhus/ora)
- [Chalk](https://github.com/chalk/chalk)
- [Nodemon](https://nodemon.io/)
- [TS-Node](https://github.com/TypeStrong/ts-node)

#### Linting

- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## Getting started

| :exclamation: Note: This project uses ESM modules. |
| -------------------------------------------------- |

### Prerequisites

- Node.js v14.15.4 or later
- A Prisma-compatible database (e.g. MySQL)
- A Firebase project with the Authentication enabled

### Building and running

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the values
3. Download the Firebase service account JSON file and place it in the root
   directory
4. Install dependencies with `npm install`
5. Build the project with `npm run build`
6. Start the server with `npm start`

## Usage

Every router is prefixed with `/api`. The default port is `5000`.

The convention is to have a single router per resource. Every router exposes
CRUD operations for said resource. For example, the `posts.ts` router maps to
`/api/posts`.

You can secure your routes by using the `authGuard` middleware and optionally
specify if the user is required to have a profile (useful for the `/register`
endpoint since the user doesn't have a profile yet) or a specific role.

Resource routers return JSON data and follow a roughly RESTful API design. There
are some exceptions:

- The `auth.ts` router is used for authentication. It exposes only a single
  endpoint, `/register`, which is used to create a new user using a newly
  generated Firebase ID token.
- The `uploads.ts` router contains the `/:id/download` endpoint, which is used
  to download private files.

## Contributing

Contributions are welcome! For major changes, please open an issue first to
discuss what you would like to change.

This project uses custom ESLint and Prettier rules. Please make sure to run
`npm run lint` before committing.

This project uses Zod validation schemas to provide runtime type checking. Make
sure all types are _actually_ valid instead of blindly trusting Typescript.

### Folder structure

> A basic explanation of the folder structure.

    src/
    ├── index.ts			# Entry point of the application.
    ├── app.ts				# Contains the App class that registers all the routes and middleware.
    ├── api				    # Contains net-related code (HTTP requests, clients, etc.). Barebones API calls start with "fetch", while composed API calls start with "get".
    ├── lib					# Contains code that is not specific to the application (e.g. database connection, logger, etc.).
    ├── middleware 			# Contains middleware functions.
    ├── routes				# Contains route definitions.
    ├── schemas				# Contains Zod schemas and their types.
    ├── types				# Contains types that are used throughout the application.
    └── utils				# Contains pure utility functions.
    scripts/
    ├── build.ts            # Builds the project. Removes old builds if necessary.
    ├── dev.ts              # Starts the server in "watch" mode.
    ├── logger.ts           # Logger that is used by the scripts.
    └── start.ts            # Runs the built project.
