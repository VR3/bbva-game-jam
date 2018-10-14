
/**
 * GET /configuration
 * Get the game's configuration screen.
 */
exports.getIndex = (req, res, next) => {
  res.render('admin/configuration', {
    title: 'Configuración',
  });
};

/**
 * POST /configuration/update
 * Update the configuration
 */
exports.updateConfiguration = (req, res, next) => {
  req.flash('success', { msg: 'La configuración ha sido actualizada correctamente' });
  req.flash('info', { msg: 'Se ha comenzado a aplicar la nueva configuración de juego, se realizan las desconexiones pertinentes' });
  req.flash('errors', { msg: 'Servidores Reiniciándose...' });
  req.flash('success', { msg: '¡Servidores Actualizaods correctamente!' });
  return res.redirect('/dashboard');
};
