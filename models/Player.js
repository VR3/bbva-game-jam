const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  password: String,
}, { timestamps: true });

/**
 * Password hash middleware.
 */
playerSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating player's password.
 */
playerSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
