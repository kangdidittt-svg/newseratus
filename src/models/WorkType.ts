import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkType extends Document {
  name: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkTypeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Work type name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Design'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent re-compilation during development
const WorkType = mongoose.models.WorkType || mongoose.model<IWorkType>('WorkType', WorkTypeSchema);

export default WorkType;