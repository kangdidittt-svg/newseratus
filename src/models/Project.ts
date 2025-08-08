import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description?: string;
  client: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  category: string;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  hourlyRate?: number;
  hoursWorked?: number;
  totalEarned?: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    client: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [100, 'Client name cannot exceed 100 characters']
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'on-hold', 'cancelled'],
      default: 'active'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    },
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative']
    },
    hoursWorked: {
      type: Number,
      min: [0, 'Hours worked cannot be negative'],
      default: 0
    },
    totalEarned: {
      type: Number,
      min: [0, 'Total earned cannot be negative'],
      default: 0
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    }
  },
  {
    timestamps: true
  }
);

// Calculate total earned based on hours worked and hourly rate
ProjectSchema.pre('save', function(next) {
  if (this.hoursWorked && this.hourlyRate) {
    this.totalEarned = Number(this.hoursWorked) * Number(this.hourlyRate);
  }
  next();
});

// Prevent re-compilation during development
const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;