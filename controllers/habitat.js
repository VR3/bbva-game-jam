const Habitat = require('../models/Habitat');

/**
 * GET /habitats
 * Get a list of all the habitats
 */
exports.indexHabitats = (req, res, next) => {
  Habitat.find({})
    .exec()
    .then((habitats) => {
      res.render('admin/habitats/index', {
        title: 'Hábitats',
        habitats,
      });
    })
    .catch(err => next(err));
};
