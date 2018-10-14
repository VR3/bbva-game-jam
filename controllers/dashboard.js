const Player = require('../models/Player');

/**
 * GET /dashboard
 * Get the dashboard page.
 */
exports.getDashboard = (req, res, next) => {
  Player.countDocuments()
    .exec()
    .then((totalPlayers) => {
      res.render('admin/dashboard', {
        title: 'Dashboard',
        totalPlayers
      });
    })
    .catch(err => next(err));
};
