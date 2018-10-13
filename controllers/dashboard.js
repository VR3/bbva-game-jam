/**
 * GET /dashboard
 * Get the dashboard page.
 */
exports.getDashboard = (req, res, next) => {
  res.render('admin/dashboard', {
    title: 'Dashboard'
  });
};
