'use strict';

const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    slug: {
        type: String,
    },
    image: {
        type: String
    },
    type: {
        type: String
    },
    parameter_type: {
        type: String
    },
    popular: {
        type: Boolean,
        default: false
    },
    attributes: [
        {
            name: { type: String },
            value: { type: String, default: '' }
        }
    ]
}, {
    timestamps: true
});

categorySchema.set('toJSON', {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Category', categorySchema);