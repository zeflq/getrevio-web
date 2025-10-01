// server.js
const jsonServer = require('json-server');
const cors = require('cors');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(middlewares);
// (optional but harmless)
server.use(jsonServer.bodyParser);

// Quick Stats endpoint: counts of places, campaigns, shortlinks per merchant
server.get('/merchants/:id/stats', (req, res) => {
  const { id } = req.params;
  const db = router.db; // lowdb instance

  // Prefer explicit stats from db.json if present
  const explicit = db.get('merchantStats').find({ merchantId: id }).value();
  if (explicit) {
    return res.json({
      places: explicit.places ?? 0,
      campaigns: explicit.campaigns ?? 0,
      shortlinks: explicit.shortlinks ?? 0,
    });
  }

  // Fallback: compute counts from collections
  const placesCount = db.get('places').filter({ merchantId: id }).size().value();
  const campaignsCount = db.get('campaigns').filter({ merchantId: id }).size().value();
  const shortlinksCount = db.get('shortlinks').filter({ merchantId: id }).size().value();

  return res.json({
    places: placesCount,
    campaigns: campaignsCount,
    shortlinks: shortlinksCount,
  });
});

router.render = (req, res) => {
  // total from header (only present on collection + _page/_limit)
  const totalHeader = res.getHeader('X-Total-Count');
  const total = typeof totalHeader !== 'undefined' ? parseInt(totalHeader, 10) : undefined;

  // Robust query parsing (works even if req.query is empty here)
  const url = new URL(req.originalUrl, 'http://localhost'); // base is required
  const hasPage = url.searchParams.has('_page');
  const hasLimit = url.searchParams.has('_limit');
  const page = parseInt(url.searchParams.get('_page') || '1', 10);
  const limit = parseInt(url.searchParams.get('_limit') || '10', 10);

  if (hasPage && hasLimit && typeof total === 'number' && Array.isArray(res.locals.data)) {
    const totalPages = Math.ceil(total / limit);
    return res.json({
      data: res.locals.data,
      total,
      page,
      totalPages,
    });
  }

  // fallback: default json-server response
  return res.json(res.locals.data);
};

server.use('/', router);

server.listen(4000, () => {
  console.log('JSON Server running on http://localhost:4000');
});
