const mongoose = require('mongoose');

const animalBranchSchema = new mongoose.Schema({
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  },
  validUntil: Date,
}, { timestamps: true });

const AnimalBranch = mongoose.model('AnimalBranch', animalBranchSchema);

module.exports = AnimalBranch;
