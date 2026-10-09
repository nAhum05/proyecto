const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },

  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },

  birthDate: { 
    type: Date, 
    required: true 
  },

  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },

  password: { 
    type: String, 
    required: true 
  },

  bio: {
    type: String,
    default: ''
  },

  role: {
    type: String,
    enum: ['usuario', 'moderador', 'administrador'],
    default: 'usuario'
  },

  status: {
    type: String,
    enum: ['activo', 'suspendido', 'baneado'],
    default: 'activo'
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);