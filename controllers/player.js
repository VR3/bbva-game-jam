const Player = require('../models/Player');
const Bag = require('../models/Bag');

/**
 * GET /players
 * Show the list of players registered on the game
 */
exports.getIndex = (req, res, next) => {
  Player.find({})
    .exec()
    .then((players) => {
      res.render('admin/players/index', {
        title: 'Jugadores',
        players,
      });
    })
    .catch(err => next(err));
};

/**
 * GET /players/:id
 * Show the player profile
 */
exports.getPlayer = (req, res, next) => {
  Player.findById(req.params.id)
    .exec()
    .then((player) => {
      if (!player) {
        req.flash('errors', { msg: 'El jugador que buscas no existe' });
        return res.redirect('/players');
      }
      Bag.find({ player })
        .populate({
          path: 'animalBranch',
          populate: {
            path: 'branch',
            populate: {
              path: 'habitat',
            },
          },
        })
        .populate({
          path: 'animalBranch',
          populate: {
            path: 'animal',
          },
        })
        .exec()
        .then((playerObjects) => {
          res.render('admin/players/profile', {
            title: 'Jugadores',
            player,
            playerObjects,
          });
        });
    })
    .catch(err => next(err));
};

/**
 * GET /players/:id/delete
 * Delete a player from storage
 */
exports.deletePlayer = (req, res, next) => {
  Player.findByIdAndRemove(req.params.id)
    .exec()
    .then((deletedPlayer) => {
      if (!deletedPlayer) {
        req.flash('errors', { msg: 'El jugador que intentas eliminar no existe' });
        return res.redirect('/players');
      }
      return Bag.deleteMany({ player: req.params.id }, (err) => {
        if (err) { next(err); }
        req.flash('success', { msg: 'El jugador y todos sus  elementos de la mochila han sido eliminados correctamente' });
        return res.redirect('/players');
      });
    })
    .catch(err => next(err));
};
