/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const apiController = require('./controllers/api');
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const contactController = require('./controllers/contact');
const dashboardController = require('./controllers/dashboard');
const habitatController = require('./controllers/habitat');
const animalController = require('./controllers/animal');
const branchController = require('./controllers/branch');
const playerController = require('./controllers/player');
const configurationController = require('./controllers/configuration');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected: ', process.env.MONGODB_URI);
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (/api/.test(req.path)) {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user
    && req.path !== '/login'
    && req.path !== '/signup'
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user
    && (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));
app.use('/admin', express.static(path.join(__dirname, 'node_modules/paper-dashboard-2/assets'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * Admin Routes
 */
// Dashboard
app.get('/dashboard', passportConfig.isAuthenticated, dashboardController.getDashboard);
// Habitats
app.get('/habitats', passportConfig.isAuthenticated, habitatController.indexHabitats);
app.get('/habitats/create', passportConfig.isAuthenticated, habitatController.createHabitat);
app.post('/habitats', passportConfig.isAuthenticated, habitatController.storeHabitat);
app.get('/habitats/:id/edit', passportConfig.isAuthenticated, habitatController.editHabitat);
app.post('/habitats/:id/update', passportConfig.isAuthenticated, habitatController.updateHabitat);
app.get('/habitats/:id/delete', passportConfig.isAuthenticated, habitatController.deleteHabitat);
// Animals
app.get('/animals', passportConfig.isAuthenticated, animalController.indexAnimals);
app.get('/animals/create', passportConfig.isAuthenticated, animalController.createAnimal);
app.post('/animals', passportConfig.isAuthenticated, animalController.storeAnimal);
app.get('/animals/:id/edit', passportConfig.isAuthenticated, animalController.editAnimal);
app.post('/animals/:id/update', passportConfig.isAuthenticated, animalController.updateAnimal);
app.get('/animals/:id/delete', passportConfig.isAuthenticated, animalController.deleteAnimal);
// Branches
app.get('/branches', passportConfig.isAuthenticated, branchController.indexBranches);
app.get('/branches/create', passportConfig.isAuthenticated, branchController.createBranch);
app.post('/branches', passportConfig.isAuthenticated, branchController.storeBranch);
app.get('/branches/:id/edit', passportConfig.isAuthenticated, branchController.editBranch);
app.post('/branches/:id/update', passportConfig.isAuthenticated, branchController.updateBranch);
app.get('/branches/:id/delete', passportConfig.isAuthenticated, branchController.deleteBranch);
app.get('/branches/seed', branchController.seed);
// Players
app.get('/players', passportConfig.isAuthenticated, playerController.getIndex);
app.get('/players/:id', passportConfig.isAuthenticated, playerController.getPlayer);
app.get('/players/:id/delete', passportConfig.isAuthenticated, playerController.deletePlayer);
// Configuration
app.get('/configuration', passportConfig.isAuthenticated, configurationController.getIndex);
app.post('/configuration/update', passportConfig.isAuthenticated, configurationController.updateConfiguration);

/**
 * API Routes
 */
app.get('/api/ping', (req, res) => res.send('pong'));
app.post('/api/branches-nearby', apiController.getBranchLocations);
app.post('/api/players/signup', apiController.playerSignup);
app.post('/api/players/login', apiController.playerLogin);
app.get('/api/branches/:id/animals', apiController.getAnimalsBranches);
app.post('/api/bag/add-animal', apiController.addAnimalToBag);
app.post('/api/bag', apiController.getBag);
app.post('/api/animal-release/:id', apiController.releaseAnimalInBranch);

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
