# development documentation

- First of all, thank you for considering on helping with the code
- Second, sorry in advance

# General

- `npm run dev` to just run it
- `npx wrangler types` should fix the errors/warnings relating to `env`
  - You may need to manually add a `.env` file containing some variables, see [S3](#s3) for more

# Frontend

If you are editing frontend, run `npm run dev:front` to make it auto-update. (you need to run backend too)

## Structure

- `/front/src/` is just react
- `/front/assets/` gets copied to `/public/` (or `/`)
- `/front/src/pages/` should have all the pages themselves
- Make sure every html file at `/front/` points to a file in `/front/src/entry/`

## Notes

- there are quite a bit of unused things there, (example, `/src/hooks/theme.ts`) just ignore them!
- please dont remove my comments i think they're funny

# Backend

If you are editing backend, run `npm run dev` to start local server.

## S3

There is a `compose.yaml` which allows you to host your own local S3 server. Run `docker compose up` in the root of the project to host the server. You will need the following environment variables to run with the local server (you can just paste this into a `.env` file):

```env
S3_REGION="auto"
S3_ENDPOINT="http://localhost:8080/osadle-bucket/"
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
LOCAL_DEV=1
```

You will also have to visit [http://localhost:8080/\_ui] and create a bucket named `osadle-bucket`.

If you have your own S3 database you can put the relevant information in and remove `LOCAL_DEV`, or set it to nothing (`LOCAL_DEV=`) to generate types with `npx wrangler types`.

## Cloudflare Worker

You can run this pretty easily since `npx wrangler` lets you do this pretty easily. You should be running via `npm run dev` though.

## Database things

So, the way you'd generate the database is a little weird.

- First you'd run `npm run db:gen` to create a auto-generated schema file (pulls from `/src/db/schema.ts`)
  - This should create a directory with an `*.sql` file in `/drizzle/`.
  - If you've already ran `db:run` before this, you need to manually (or not! sometimes it does it for you) remove the existing tables.
- Second, run `npm run db:run`. This should sync it with the local cloudflare instance. (remember to restart wrangler when doing this)

## Structure

- There's not really a proper format to the backend, you can pretty much infer it from the files already there.
  - use `response()` from `utils.ts` to respond to API calls
  - new route categories (usually sorted by permission) go in `/src/routes/`
  - gamemodes, of course, go in `/src/games/` (you will have to register in `/src/games/index.ts`)
  - Make sure all API endpoints start with `/api/`
