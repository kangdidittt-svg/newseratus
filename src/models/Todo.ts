import mongoose, { Document, Schema } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  projectId?: mongoose.Types.ObjectId;
  notes?: string;
  dueDateStr: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'done';
  order?: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const TodoSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title too long']
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: false
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes too long']
    },
    dueDateStr: {
      type: String,
      required: [true, 'Due date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/ , 'Invalid date format']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'done'],
      default: 'pending'
    },
    order: {
      type: Number,
      default: 0
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

TodoSchema.index({ userId: 1, dueDateStr: 1 });

const Todo = mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);

export default Todo;

