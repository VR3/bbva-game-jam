const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  name: String,
  description: String,
  habitat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habitat',
  }
}, { timestamps: true });

const Animal = mongoose.model('Animal', animalSchema);

module.exports = Animal;
