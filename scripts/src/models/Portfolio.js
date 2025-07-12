"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var portfolioSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    // Geriye uyumluluk için eski categoryId alanını koruyoruz
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Category',
        required: false, // Artık zorunlu değil
    },
    // Yeni çoklu kategori desteği
    categoryIds: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Category',
            required: false,
        }],
    client: {
        type: String,
        required: true,
    },
    completionDate: {
        type: Date,
        required: true,
    },
    technologies: [{
            type: String,
        }],
    coverImage: {
        type: String,
        required: true,
    },
    images: [{
            type: String,
        }],
    featured: {
        type: Boolean,
        default: false,
    },
    order: {
        type: Number,
        default: 0,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
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
// Slug otomatik üretimi
portfolioSchema.pre('validate', function (next) {
    if (this.title && (!this.slug || this.isModified('title'))) {
        this.slug = this.title
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});
exports.default = mongoose_1.default.models.Portfolio || mongoose_1.default.model('Portfolio', portfolioSchema);
