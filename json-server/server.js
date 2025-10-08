const jsonServer = require('json-server');
const cors = require('cors');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

/* ---------- Custom endpoints (place BEFORE server.use('/', router)) ---------- */

// Quick Stats
server.get('/merchants/:id/stats', (req, res) => {
  const { id } = req.params;
  const db = router.db;

  const explicit = db.get('merchantStats').find({ merchantId: id }).value();
  if (explicit) {
    return res.json({
      places: explicit.places ?? 0,
      campaigns: explicit.campaigns ?? 0,
      shortlinks: explicit.shortlinks ?? 0,
    });
  }

  const places = db.get('places').filter({ merchantId: id }).size().value();
  const campaigns = db.get('campaigns').filter({ merchantId: id }).size().value();
  const shortlinks = db.get('shortlinks').filter({ merchantId: id }).size().value();
  return res.json({ places, campaigns, shortlinks });
});

// Slug check for places
server.get('/places/slug-check', (req, res) => {
  const url = new URL(req.originalUrl, 'http://localhost');
  const slug = url.searchParams.get('slug');
  if (!slug) return res.json({ exists: false });
  const db = router.db;
  const exists = !!db.get('places').find({ slug }).value();
  return res.json({ exists });
});

// Set default theme for a merchant
server.post('/merchants/:id/themes/:themeId/default', (req, res) => {
  const { id, themeId } = req.params;
  const db = router.db;

  const merchant = db.get('merchants').find({ id });
  if (!merchant.value()) return res.status(404).json({ error: 'Merchant not found' });

  merchant.assign({ defaultThemeId: themeId }).write();
  return res.json({ success: true, merchantId: id, defaultThemeId: themeId });
});

/* -------------------------- Custom renderer stays --------------------------- */
router.render = (req, res) => {
  const totalHeader = res.getHeader('X-Total-Count');
  const total = typeof totalHeader !== 'undefined' ? parseInt(totalHeader, 10) : undefined;

  const url = new URL(req.originalUrl, 'http://localhost');
  const hasPage = url.searchParams.has('_page');
  const hasLimit = url.searchParams.has('_limit');
  const page = parseInt(url.searchParams.get('_page') || '1', 10);
  const limit = parseInt(url.searchParams.get('_limit') || '10', 10);
  const lite = url.searchParams.get('_lite') === 'true';

  if (lite && req.path.startsWith('/merchants') && Array.isArray(res.locals.data)) {
    return res.json(res.locals.data.map((m) => ({ id: m.id, name: m.name })));
  }

  if (hasPage && hasLimit && typeof total === 'number' && Array.isArray(res.locals.data)) {
    const totalPages = Math.ceil(total / limit);
    return res.json({ data: res.locals.data, total, page, totalPages });
  }

  return res.json(res.locals.data);
};

/* ------------------------------ Router mount -------------------------------- */
server.use('/', router);

server.listen(4000, () => {
  console.log('JSON Server running on http://localhost:4000');
});
