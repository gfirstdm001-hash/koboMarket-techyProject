import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true, index: true },
    priceKobo: { type: Number, required: true, min: 1 },
    stock: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Full-text search index across title and description
productSchema.index({ title: 'text', description: 'text' });

// Compound index for cursor pagination
productSchema.index({ createdAt: -1, _id: -1 });

export const Product = mongoose.model('Product', productSchema);
