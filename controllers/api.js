const faker = require('faker');
const Branch = require('../models/Branch');
const Player = require('../models/Player');
const AnimalBranch = require('../models/AnimalBranch');
const Bag = require('../models/Bag');
const Animal = require('../models/Animal');

/**
 * POST /api/player/signup
 * Register a new player in the game
 */
exports.playerSignup = (req, res) => {
  // Validation
  req.assert('fname', 'Necesitamos tu(s) nombre(s)').notEmpty();
  req.assert('lname', 'Necesitamos tu(s) apellido(s)').notEmpty();
  req.assert('email', 'La dirección de correo electrónico es obligatoria').notEmpty();
  req.assert('password', 'La contraseña es obligatoria').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.json({
      status: 'fail',
      payload: errors,
    });
  }
  Player.findOne({ email: req.body.email })
    .exec()
    .then((usedEmail) => {
      if (usedEmail) {
        return res.json({
          status: 'fail',
          payload: [{ msg: 'Ese correo electrónico ya está asociado a una cuenta existente' }],
        });
      }
      const newPlayer = new Player(req.body);
      return newPlayer.save().then(savedPlayer => res.json({
        status: 'success',
        payload: savedPlayer,
      }));
    })
    .catch(err => res.status(500).json({
      status: 'error',
      error: err,
    }));
};

/**
 * POST /api/player/login
 * LogIn an existing Player into the game
 */
exports.playerLogin = (req, res) => {
  // Validation
  req.assert('email', 'Ingresa un correo electrónico válido').notEmpty();
  req.assert('password', 'Ingresa tu contraseña').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.json({
      status: 'fail',
      payload: errors,
    });
  }

  Player.findOne({ email: req.body.email })
    .exec()
    .then((foundPlayer) => {
      if (!foundPlayer) {
        return res.json({
          status: 'fail',
          payload: [{ msg: 'No existe ninguna cuenta asociada a ese correo electrónico ' }],
        });
      }
      return foundPlayer.comparePassword(req.body.password, (err, isMatch) => {
        if (err) {
          res.status(500).json({
            status: 'error',
            error: err,
          });
        }
        if (isMatch) {
          return res.json({
            status: 'success',
            payload: foundPlayer,
          });
        }
        return res.json({
          status: 'fail',
          payload: [{ msg: 'Correo y/o contraseña inválidos' }],
        });
      });
    })
    .catch(err => res.status(500).json({
      status: 'error',
      error: err,
    }));
};

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

/**
 * GET /api/branches/:id/animals
 * Get all the animals available for a branch
 */
exports.getAnimalsBranches = (req, res) => {
  AnimalBranch.find({ branch: req.params.id })
    .where('validUntil').gt(Date.now())
    .populate('animal')
    .populate('branch')
    .exec()
    .then((animals) => {
      if (animals.length < animals[0].branch.capacity) {
        Animal.find({})
          .exec()
          .then((animalsCatalog) => {
            for (let i = animals.length; i < animals[0].capacity; i++) {
              const newAnimalBranch = new AnimalBranch({
                branch: req.params.id,
                animal: faker.random.arrayElement(animalsCatalog),
                validUntil: Date.now() + faker.random.number({ min: 3600000, max: (3600000 * 10) }),
              });
              newAnimalBranch.save();
            }
          });
      }
      res.json({
        status: 'success',
        payload: animals,
      });
    })
    .catch(err => res.status(500).json({
      status: 'error',
      error: err,
    }));
};

/**
 * POST /api/bag/add-animal
 * Add a new animal to the user's bag
 */
exports.addAnimalToBag = (req, res) => {
  // Validation
  req.assert('player', 'El ID del jugador es necesario').notEmpty();
  req.assert('animalBranch', 'El ID de la instancia del animal en sucursal (no el ID del animal) es necesario').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.json({
      status: 'fail',
      payload: errors,
    });
  }

  const newAnimalinBag = new Bag({
    player: req.body.player,
    animalBranch: req.body.animalBranch,
  });
  return newAnimalinBag.save().then((savedAnimal) => {
    res.json({
      status: 'success',
      payload: savedAnimal,
    });
  })
    .catch(err => res.status(500).json({
      status: 'error',
      error: err,
    }));
};

/**
 * POST /api/bag
 * Get the bag contents for the user
 */
exports.getBag = (req, res) => {
  // Validation
  req.assert('player', 'El ID del jugador es necesario').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.json({
      status: 'fail',
      payload: errors,
    });
  }

  return Bag.find({ player: req.body.player })
    .exec()
    .then(animals => res.json({
      status: 'success',
      payload: animals,
    }))
    .catch(err => res.status(500).json({
      status: 'error',
      error: err,
    }));
};

/**
 * POST /api/animal-release/:id
 * Release an animal in the branch
 */
exports.releaseAnimalInBranch = (req, res) => Bag.findByIdAndUpdate(req.params.id, { delivered: true }, { new: true })
  .exec()
  .then((bag) => {
    if (!bag) {
      return res.json({
        status: 'fail',
        payload: [{ msg: 'El animal que intentas liberar no existe en tu mochila' }],
      });
    }
    return res.json({
      status: 'success',
      payload: bag,
    });
  })
  .catch(err => res.status(500).json({
    status: 'error',
    error: err,
  }));
