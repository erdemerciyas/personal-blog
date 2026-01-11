import mongoose from 'mongoose';

const Model3DSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for the 3D model'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [200, 'Description cannot be more than 200 characters'],
    },
    file: {
        type: String,
        required: [true, 'Please upload a 3D model file'],
    },
    fileSize: {
        type: Number,
        required: true,
    },
    downloads: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Model3D || mongoose.model('Model3D', Model3DSchema);
