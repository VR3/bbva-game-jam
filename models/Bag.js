const mongoose = require('mongoose');

const bagSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  },
  animalBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnimalBranch',
  },
  delivered: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Bag = mongoose.model('Bag', bagSchema);

module.exports = Bag;
