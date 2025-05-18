## Setup.

Backend Environment values.

```shell
MONGODB_URI=mongodb://localhost:27017/instagram
REDIS_HOST=localhost
REDIS_PORT=6378
NODE_ENV=development #production
IG_USERNAME=username
IG_PASSWORD=password
DEBUG_PLAYWRIGHT=false
PLAYWRIGHT_DEFAULT_TIMEOUT=60000
IG_COOKIE_JSON=cookie
IG_LOCAL_JSON=localstorage.
```

## Running Backend

```shell
npm run dev `or` npm start
```

## Frontend Environment variables

```shell
VITE_APP_ENV=Development
VITE_BACKEND_URL=http://localhost:8080
```

## Running Frontend

```shell
npm run dev
```

### Backend API endpoints.

```
POST <url>/api/reels - Create a scraping job.
GET <url>/api/reels - Get the reels
   Supports page, limit, id and jobId to filter the results with pagination.
GET <url>/api/export - Exports data into csv file.
```
