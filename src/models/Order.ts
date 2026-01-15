import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    // Legacy Single Product Fields (Optional now)
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false,
    },
    productName: { type: String, required: false }, // Legacy
    productSlug: { type: String, required: false }, // Legacy
    quantity: { type: Number, required: false, default: 1 }, // Legacy
    price: { type: Number, required: false, default: 0 }, // Legacy

    // New Multi-Item Support
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: String,
        productSlug: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Snapshotted Unit Price
        attributes: mongoose.Schema.Types.Mixed
    }],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },

    customerName: {
        type: String,
        required: true,
        trim: true,
    },
    customerEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true,
    },
    customerAddress: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    note: {
        type: String,
        trim: true,
    },

    selectedOptions: [{
        group: String,
        option: String
    }],
    guestId: {
        type: String, // For guest checkout tracking
        index: true,
    },
    paymentId: {
        type: String,
    },
    paymentProvider: {
        type: String, // e.g., 'iyzico', 'stripe', 'mock'
    },
    status: {
        type: String,
        enum: ['new', 'pending', 'paid', 'preparing', 'shipped', 'completed', 'cancelled', 'refunded'],
        default: 'pending',
    },
    adminNotes: {
        type: String,
    },
    cargoCarrier: { type: String }, // e.g., 'Yurtiçi Kargo'
    isUserVisible: {
        type: Boolean,
        default: true
    },
    deletedAt: {
        type: Date,
        index: true, // For faster cleanup queries
    }
}, {
    timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
