const Branch = require('../models/Branch');
const Player = require('../models/Player');

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
          payload: [{ msg: 'Ese correo electrónico ya está asociado a una cuenta existente' }],
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
