const Animal = require('../models/Animal');
const Habitat = require('../models/Habitat');

/**
 * GET /animals
 * Show the index page for the animals
 */
exports.indexAnimals = (req, res, next) => {
  Animal.find({})
    .populate('habitat')
    .exec()
    .then((animals) => {
      res.render('admin/animals/index', {
        title: 'Animales',
        animals,
      });
    })
    .catch(err => next(err));
};

/**
 * GET /animals/create
 * Create a new animal in storage
 */
exports.createAnimal = (req, res, next) => {
  Habitat.find({})
    .exec()
    .then((habitats) => {
      res.render('admin/animals/create', {
        title: 'Animales',
        habitats,
      });
    })
    .catch(err => next(err));
};

/**
 * POST /animals
 * Store an animal in sotrage
 */
exports.storeAnimal = (req, res, next) => {
  // Validation
  req.assert('name', 'El nombre del animal es necesario').notEmpty();
  req.assert('description', 'La descripción del animal es necesaria').notEmpty();
  req.assert('habitat', 'Debes seleccionar un hábitat para el animal forzosamente').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/animals/create');
  }

  const newAnimal = new Animal(req.body);

  return newAnimal.save().then((savedAnimal) => {
    req.flash('success', { msg: `El animal ${savedAnimal.name} ha sido guardado correctamente` });
    return res.redirect('/animals');
  })
    .catch(err => next(err));
};

/**
 * GET /animals/:id/edit
 * Show the form for editint an existing animal
 */
exports.editAnimal = (req, res, next) => {
  Animal.findById(req.params.id)
    .exec()
    .then((animal) => {
      if (!animal) {
        req.flash('errors', { msg: 'El animal que deseas editar no existe' });
        return res.redirect('/animals');
      }
      return Habitat.find({})
        .exec()
        .then((habitats) => {
          res.render('admin/animals/edit', {
            title: 'Animales',
            animal,
            habitats,
          });
        });
    })
    .catch(err => next(err));
};

/**
 * POST /animals/:id/update
 * Update an existing animal in storage
 */
exports.updateAnimal = (req, res, next) => {
  // Validation
  req.assert('name', 'El nombre del animal es necesario').notEmpty();
  req.assert('description', 'La descripción del animal es necesaria').notEmpty();
  req.assert('habitat', 'Debes seleccionar un hábitat para el animal forzosamente').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(`/animals/${req.params.id}/edit`);
  }

  return Animal.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .exec()
    .then((updatedAnimal) => {
      if (!updatedAnimal) {
        req.flash('errors', { msg: 'El animal que intentas actualizar no existe' });
      } else {
        req.flash('success', { msg: 'Se ha actualizado correctamente el animal' });
      }
      return res.redirect('/animals');
    })
    .catch(err => next(err));
};

/**
 * GET /animals/:id/delete
 * Delete an animal from storage
 */
exports.deleteAnimal = (req, res, next) => {
  Animal.findByIdAndRemove(req.params.id)
    .exec()
    .then((deletedAnimal) => {
      if (!deletedAnimal) {
        req.flash('errors', { msg: 'El animal que intentas eliminar no existe' });
      } else {
        req.flash('success', { msg: 'El animal ha sido eliminado correctamente' });
      }
      return res.redirect('/animals');
    })
    .catch(err => next(err));
};
