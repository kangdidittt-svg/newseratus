import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email?: string;
  password: string;
  role: 'admin' | 'user';
  avatar?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language?: string;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    avatar: {
      type: String,
      default: '/api/placeholder/150/150'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    }
  },
  {
    timestamps: true
  }
);

// Prevent re-compilation during development
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;