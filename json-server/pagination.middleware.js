// pagination.middleware.js
module.exports = (req, res, next) => {
  const originalJson = res.json.bind(res);
  // Wrap res.json so we can reshape the body after json-server has handled the route
  res.json = (data) => {
    const totalHeader = res.getHeader('X-Total-Count');

    const shouldPaginate =
      req.method === 'GET' &&
      req.query._page &&
      req.query._limit &&
      typeof totalHeader !== 'undefined' &&
      Array.isArray(data);
    if (shouldPaginate) {
      const total = parseInt(totalHeader, 10);
      const page = parseInt(req.query._page, 10);
      const limit = parseInt(req.query._limit, 10);
      const totalPages = Math.ceil(total / limit);

      return originalJson({
        data,
        total,
        page,
        totalPages,
      });
    }

    return originalJson(data);
  };

  next();
};
