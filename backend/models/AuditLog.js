const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  ip: { type: String },
  userId: { type: String, default: 'Anónimo' },
  method: { type: String },
  url: { type: String },
  status: { type: Number },
  level: { type: String, default: 'info' },
  message: { type: String },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 604800 
  }
});


module.exports = mongoose.model('AuditLog', auditLogSchema, 'security_logs');