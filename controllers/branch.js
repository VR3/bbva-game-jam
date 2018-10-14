const faker = require('faker');
const Branch = require('../models/Branch');
const Habitat = require('../models/Habitat');

/**
 * GET /branches
 * Show the index page for all the branches
 */
exports.indexBranches = (req, res, next) => {
  Branch.find({})
    .populate('habitat')
    .exec()
    .then((branches) => {
      res.render('admin/branches/index', {
        title: 'Sucursales',
        branches,
      });
    })
    .catch(err => next(err));
};

/**
 * GET /branches/create
 * Show the form for registering a new Branch.
 */
exports.createBranch = (req, res, next) => {
  Habitat.find({})
    .exec()
    .then((habitats) => {
      res.render('admin/branches/create', {
        title: 'Sucursales',
        habitats,
      });
    })
    .catch(err => next(err));
};

/**
 * POST /branches
 * Store a new branch in storage
 */
exports.storeBranch = (req, res, next) => {
  // Validation
  req.assert('habitat', 'Es necesario el hábitat de la sucursal').notEmpty();
  req.assert('lat', 'Es necesaria la latitud de la sucursal').notEmpty();
  req.assert('long', 'Es necesaria la longitud de la sucursal').notEmpty();
  req.assert('capacity', 'La capacidad de animales de la sucursal es necesaria').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/branches/create');
  }

  const newBranch = new Branch({
    habitat: req.body.habitat,
    capacity: req.body.capacity,
    loc: {
      type: 'Point',
      coordinates: [Number(req.body.long), Number(req.body.lat)],
    }
  });

  return newBranch.save().then((savedBranch) => {
    req.flash('success', { msg: 'La sucursal se ha guardado correctamente' });
    return res.redirect('/branches');
  }).catch(err => next(err));
};

/**
 * GET /branches/:id/edit
 * Show the form for updating a branch in storage
 */
exports.editBranch = (req, res, next) => {
  Branch.findById(req.params.id)
    .exec()
    .then((branch) => {
      if (!branch) {
        req.flash('errors', { msg: 'La sucursal que intentas editar no existe' });
        return res.redirect('/branches');
      }
      return Habitat.find({})
        .exec()
        .then(habitats => res.render('admin/branches/edit', {
          title: 'Sucursales',
          branch,
          habitats,
        }));
    })
    .catch(err => next(err));
};

/**
 * POST /branches/:id/update
 * Update a branch in storage
 */
exports.updateBranch = (req, res, next) => {
  // Validation
  req.assert('habitat', 'Es necesario el hábitat de la sucursal').notEmpty();
  req.assert('lat', 'Es necesaria la latitud de la sucursal').notEmpty();
  req.assert('long', 'Es necesaria la longitud de la sucursal').notEmpty();
  req.assert('capacity', 'La capacidad de animales de la sucursal es necesaria').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(`/branches/${req.params.id}/edit`);
  }

  const update = {
    habitat: req.body.habitat,
    capacity: req.body.capacity,
    loc: {
      type: 'Point',
      coordinates: [Number(req.body.long), Number(req.body.lat)],
    }
  };

  return Branch.findByIdAndUpdate(req.params.id, update, { new: true })
    .exec()
    .then((branch) => {
      if (!branch) {
        req.flash('errors', { msg: 'La sucursal que intentas actualizar no existe' });
      } else {
        req.flash('success', { msg: 'La sucursal se actualizó correctamente' });
      }
      return res.redirect('/branches');
    })
    .catch(err => next(err));
};

/**
 * GET /branches/:id/delete
 * Delete a branch in storage.
 */
exports.deleteBranch = (req, res, next) => {
  Branch.findByIdAndRemove(req.params.id)
    .exec()
    .then((deletedBranch) => {
      if (!deletedBranch) {
        req.flash('errors', { msg: 'La sucursal que intentas eliminar no existe' });
      } else {
        req.flash('success', { msg: 'La sucursal ha sido eliminada correctamente' });
      }
      return res.redirect('/branches');
    })
    .catch(err => next(err));
};

exports.seed = (req, res, next) => {
  Habitat.find({})
    .exec()
    .then((habitats) => {
      for (let index = 0; index < 1795; index++) {
        const element = new Branch({
          habitat: faker.random.arrayElement(habitats),
          loc: {
            type: 'Point',
            coordinates: [Number(faker.random.number({ min: -99.1820485, max: -95.1820485 })), Number(faker.random.number({ min: 19.4255024, max: 19.6255024 }))],
          },
          capacity: faker.random.number({ min: 5, max: 50 }),
        });
        element.save();
      }
    })
    .catch(err => next(err));
  res.redirect('/branches');
};
