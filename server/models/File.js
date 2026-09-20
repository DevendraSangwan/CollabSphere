const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream'
    },
    size: {
      type: Number,
      default: 0
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('FileDoc', fileSchema);
