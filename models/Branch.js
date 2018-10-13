const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  habitat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habitat',
  },
  loc: {
    type: { type: String },
    coordinates: [],
  },
  capacity: Number,
}, { timestamps: true });

/**
 * Set index for Geographic manipulation.
 */
branchSchema.index({ loc: '2dsphere' });

const Branch = mongoose.model('Branch', branchSchema);

module.exports = Branch;
