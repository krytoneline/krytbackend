'use strict';

const mongoose = require('mongoose');
const transactionHistorySchema = new mongoose.Schema({

    userType: {
        type: String,
        trim: true,
    },
    notification: {
        type: String,
        trim: true,
    },
    transactionType: {
        type: String,
    },
    amount:{
        type: Number, 
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    order_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductRequest",
    }

}, {
    timestamps: true
});

transactionHistorySchema.set('toJSON', {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Transaction', transactionHistorySchema);