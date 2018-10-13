const mongoose = require('mongoose');

const habitatSchema = new mongoose.Schema({
  name: String,
  description: String,
}, { timestamps: true });

const Habitat = mongoose.model('Habitat', habitatSchema);

module.exports = Habitat;
