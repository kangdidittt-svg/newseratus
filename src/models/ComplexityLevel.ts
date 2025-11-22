import mongoose, { Document, Schema } from 'mongoose';

export interface IComplexityLevel extends Document {
  name: string;
  weight: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ComplexityLevelSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Complexity level name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [1, 'Weight must be at least 1'],
      max: [10, 'Weight cannot exceed 10']
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
const ComplexityLevel = mongoose.models.ComplexityLevel || mongoose.model<IComplexityLevel>('ComplexityLevel', ComplexityLevelSchema);

export default ComplexityLevel;