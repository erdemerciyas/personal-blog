import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productName: { // Storing name for redundancy
        type: String,
        required: true,
    },
    productSlug: {
        type: String,
        required: true,
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
    note: {
        type: String,
        trim: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    selectedOptions: [{
        group: String,
        option: String
    }],
    status: {
        type: String,
        enum: ['new', 'processing', 'shipped', 'completed', 'cancelled'],
        default: 'new',
    },
    adminNotes: {
        type: String,
    },
}, {
    timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
