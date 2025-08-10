import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['project_completed', 'payment_received', 'deadline_reminder', 'general', 'info'], 
    default: 'general' 
  },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  projectTitle: { type: String },
  clientName: { type: String },
  amount: { type: Number },
  unread: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);