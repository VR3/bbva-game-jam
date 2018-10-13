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

/**
 * GET /habitats/create
 * Show the form for creating a new habitat.
 */
exports.createHabitat = (req, res, next) => {
  res.render('admin/habitats/create', {
    title: 'Hábitats'
  });
};

/**
 * POST /habitats
 * Store a new habitat in storage
 */
exports.storeHabitat = (req, res, next) => {
  // Validation
  req.assert('name', 'El nombre del habitat es requerido').notEmpty();
  req.assert('description', 'La descripción del hábitat es necesaria').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/habitats/create');
  }

  const newHabitat = new Habitat(req.body);

  return newHabitat.save()
    .then((savedHabitat) => {
      req.flash('success', { msg: `¡Se ha guardado correctamente el hábitat ${savedHabitat.name}!` });
      return res.redirect('/habitats');
    })
    .catch(err => next(err));
};

/**
 * GET /habitats/:id/edit
 * Show the form for editting a existing habitat
 */
exports.editHabitat = (req, res, next) => {
  Habitat.findById(req.params.id)
    .exec()
    .then((habitat) => {
      if (!habitat) {
        req.flash('errors', { msg: 'El hábitat que intentas editar no existe' });
        return res.redirect('/habitats');
      }
      return res.render('admin/habitats/edit', {
        title: 'Hábitats',
        habitat,
      });
    })
    .catch(err => next(err));
};

/**
 * POST /habitats/:id/update
 * Update an existing habitat in storage
 */
exports.updateHabitat = (req, res, next) => {
  // Validation
  req.assert('name', 'El nombre del habitat es requerido').notEmpty();
  req.assert('description', 'La descripción del hábitat es necesaria').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(`/habitats/${req.params.id}/edit`);
  }

  return Habitat.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .exec()
    .then((updatedHabitat) => {
      if (updatedHabitat) {
        req.flash('success', { msg: 'Se ha modificado correctamente el Hábitat' });
      } else {
        req.flash('errors', { msg: 'El Hábitat que intentas editar no existe' });
      }
      return res.redirect('/habitats');
    })
    .catch(err => next(err));
};

/**
 * GET /habitats/:id/delete
 * Delete a habitat in storage
 */
exports.deleteHabitat = (req, res, next) => {
  Habitat.findByIdAndRemove(req.params.id)
    .exec()
    .then((habitat) => {
      if (!habitat) {
        req.flash('errors', { msg: 'El hábitat que deseas eliminar no existe' });
      } else {
        req.flash('success', { msg: 'Se ha eliminado correctamente el habitat' });
      }
      return res.redirect('/habitats');
    })
    .catch(err => next(err));
};
