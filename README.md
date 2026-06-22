# Boot.dev Guided Blog Project

## Overview
This project from a completed course from [boot.dev](https://www.boot.dev/courses/build-blog-aggregator-typescript)'s Backend Path. It gives a guided introduction to using TypeScript, PostgreSQL, and HTTP API requests to create a working RSS aggregator. Free advertising for boot.dev; I can't recommend it enough from what I've been learning through it.

## Pre-requisites
- Familiarity with TypeScript & SQL databases
- Environment setup in MacOS or Linux / WSL (Debian/Ubuntu)
- MacOS OR Linux / WSL (Debian/Ubuntu)

## Environment Setup
These instructions are derived from the course instructions. The project utilizes `node.js` and a local PostgreSQL database that need to be configured.
### Setting up the Local Repository
1. Install [nvm](https://github.com/nvm-sh/nvm)
2. Clone the project and `cd` into it with 
```
git clone https://github.com/janchpanch/blog-project.git
```
3. Run `nvm use` in your CLI
4. Ensure that:
```
node --version
# Prints: v22.15.0
```
5. Run
```
npm install
```
To install all dependencies required to run the project.
### Local PostgreSQL Setup
#### macOS with brew

`brew install postgresql@16`

#### Linux / WSL (Debian). 
Here are the docs from Microsoft, but simply:

```
sudo apt update
sudo apt install postgresql postgresql-contrib
```
Ensure the installation worked. The psql command-line utility is the default client for Postgres. Use it to make sure you're on version 16+ of Postgres:

```
psql --version
```

(Linux / WSL only) Update postgres password:

```
sudo passwd postgres
```

Enter a password, and be sure you won't forget it. You can just use something easy like postgres.

Start the Postgres server in the background
    ```
    Mac: brew services start postgresql@16
    Linux: sudo service postgresql start
    ```
Connect to the server. I recommend simply using the psql client. It's the "default" client for Postgres, and it's a great way to interact with the database. While it's not as user-friendly as a GUI like PGAdmin, it's a great tool to be able to do at least basic operations with.

Enter the psql shell:

```
Mac: psql postgres
Linux: sudo -u postgres psql
```

You should see a new prompt that looks like this:

```
postgres=#
```

Create a new database called gator:

```
CREATE DATABASE gator;
```
    
Connect to the new database:

```
\c gator
```
You should see a new prompt that looks like this:

```
gator=#
```

#### Set the user password (Linux / WSL only)

```
ALTER USER postgres PASSWORD 'postgres';
```

For simplicity, I used postgres as the password. Before, we altered the system user's password, now we're altering the database user's password.

#### Query the database

From here you can run SQL queries against the gator database. For example, to see the version of Postgres you're running, you can run:

```
SELECT version();
```

You can type exit or use `\q` to leave the psql shell.

## Command Overview

### Scripts
There's four relevant scripts in `package.json`:
```
npm run db-login - logs you into the local postgresql database 
npm run start - entrypoint to interact with the program
npm run orm-gen - generates the database migrations based on changes to `src/lib/db/schema.ts`
npm run orm-migrate - pushes the latest migration to the local postgresql database
```

TODO: actual command listings and/or adding a working `help` command 

## TODOs
Incremental changes in the near or far future for this project:
- Exhaustive error handling - some conditions are not explicitly checked but can definitely become an issue
- Command list roster with `help` 
- Refactoring to modify the base `cmdName` usage (otherwise unused within the codebase directly by commands) 

### Possible Extensions Given by the Course
- Add sorting and filtering options to the browse command
- Add pagination to the browse command
- Add concurrency to the agg command so that it can fetch more frequently
- Add a search command that allows for fuzzy searching of posts
- Add bookmarking or liking posts
- Add a TUI that allows you to select a post in the terminal and view it in a more readable format - (either in the terminal or open in a browser)
- Add an HTTP API (and authentication/authorization) that allows other users to interact with the service remotely
- Write a service manager that keeps the agg command running in the background and restarts it if it crashes
