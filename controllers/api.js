const Branch = require('../models/Branch');

/**
 * POST /api/branches-nearby
 * Get the closest branches locations
 */
exports.getBranchLocations = (req, res) => {
  // Validation
  req.assert('lat', 'La latitud es necesaria').notEmpty();
  req.assert('long', 'La longitud es necesaria').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.json({
      status: 'fail',
      payload: errors,
    });
  }

  Branch.find({
    loc: {
      $near: {
        $maxDistance: req.body.maxDistance || 1000,
        $geometry: {
          type: 'Point',
          coordinates: [req.body.long, req.body.lat],
        },
      },
    },
  })
    .exec()
    .then(branches => res.json({
      status: 'success',
      payload: branches,
    }))
    .catch((err) => {
      console.log('[ERROR] -> ', err);
      res.json({
        status: 'error',
        error: err,
      });
    });
};
