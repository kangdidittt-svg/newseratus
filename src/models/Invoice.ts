import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  projectId: mongoose.Types.ObjectId;
  projectTitle: string;
  billedToName: string;
  items: IInvoiceItem[];
  subtotal: number;
  taxPercent: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema: Schema = new Schema({
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: [0, 'Rate cannot be negative']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  }
}, { _id: false });

const InvoiceSchema: Schema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Invoice number cannot exceed 50 characters']
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Project title cannot exceed 200 characters']
    },
    billedToName: {
      type: String,
      required: [true, 'Billed to name is required'],
      trim: true,
      maxlength: [200, 'Billed to name cannot exceed 200 characters']
    },
    items: [InvoiceItemSchema],
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    taxPercent: {
      type: Number,
      default: 0,
      min: [0, 'Tax percentage cannot be negative'],
      max: [100, 'Tax percentage cannot exceed 100%']
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
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

// Index untuk performa query
InvoiceSchema.index({ userId: 1, createdAt: -1 });
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ projectId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ userId: 1, status: 1 });

// Validasi untuk memastikan total = subtotal + (subtotal * taxPercent / 100)
InvoiceSchema.pre<IInvoice>('save', function(this: IInvoice, next) {
  const calculatedTotal = this.subtotal + (this.subtotal * this.taxPercent / 100);
  if (Math.abs(this.total - calculatedTotal) > 0.01) {
    return next(new Error('Total amount calculation is incorrect'));
  }
  next();
});

// Validasi untuk memastikan jumlah items.amount = subtotal
InvoiceSchema.pre<IInvoice>('save', function(this: IInvoice, next) {
  const calculatedSubtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  if (Math.abs(this.subtotal - calculatedSubtotal) > 0.01) {
    return next(new Error('Subtotal does not match items total'));
  }
  next();
});

// Prevent re-compilation during development
const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;