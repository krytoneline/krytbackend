'use strict';

const mongoose = require('mongoose');
const walletRequestSchema = new mongoose.Schema({

    note: {
        type: String,
        trim: true,
    },
    amount: {
        type: Number,
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        default:'Pending'
    },

}, {
    timestamps: true
});

walletRequestSchema.set('toJSON', {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('WalletRequest', walletRequestSchema);