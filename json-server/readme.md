Start the JSON server:

json-server db.json --port 4000 --middlewares pagination.middleware.js

Custom endpoints:

- GET /merchants/:id/stats
  Returns quick counts for a merchant.

Response shape:

{
  "places": 2,
  "campaigns": 2,
  "shortlinks": 3
}

Notes:
- Counts are computed from `places`, `campaigns`, and `shortlinks` collections by `merchantId`.
- Pagination middleware also reshapes list responses to `{ data, total, page, totalPages }` when `_page` and `_limit` are provided.