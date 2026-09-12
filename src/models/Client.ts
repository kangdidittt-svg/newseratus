import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IClient extends Document {
  name: string;
  nameNormalized: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export function normalizeClientName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface IClientModel extends Model<IClient> {
  normalizeName(name: string): string;
}

const ClientSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [120, 'Client name cannot exceed 120 characters']
    },
    nameNormalized: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [150, 'Email cannot exceed 150 characters']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [50, 'Phone cannot exceed 50 characters']
    },
    company: {
      type: String,
      trim: true,
      maxlength: [150, 'Company cannot exceed 150 characters']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index so each user cannot have duplicate clients under the same normalized name
ClientSchema.index({ userId: 1, nameNormalized: 1 }, { unique: true });

// Always keep nameNormalized in sync before validation
ClientSchema.pre('validate', function(next) {
  if (this.name) {
    this.nameNormalized = normalizeClientName(this.name as string);
  }
  next();
});

ClientSchema.statics.normalizeName = normalizeClientName;

const Client = (mongoose.models.Client as IClientModel) || mongoose.model<IClient, IClientModel>('Client', ClientSchema);

export default Client;
