const Player = require('../models/Player');

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
      return res.render('admin/players/profile', {
        title: 'Jugadores',
        player,
      });
    })
    .catch(err => next(err));
};
