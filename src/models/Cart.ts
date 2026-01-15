import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },
    attributes: {
        type: Map,
        of: String,
        default: {},
    },
    // Snapshot of price at the time of adding (optional, but good for validation)
    price: {
        type: Number,
        required: false
    }
}, { _id: false });

const CartSchema = new mongoose.Schema({
    // For Guest Users: A UUID stored in cookie
    cartId: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined if we strictly use userId for logged in
        index: true,
    },
    // For Authenticated Users
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        sparse: true,
        index: true,
    },
    items: [CartItemSchema],
}, {
    timestamps: true,
});

// Index to ensure we can look up by either cartId or userId efficiently
CartSchema.index({ cartId: 1, userId: 1 });

// TTL Index: Automatically delete guest carts after 30 days if not updated
CartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
