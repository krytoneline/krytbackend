"use strict";

const mongoose = require("mongoose");
const chatconnection = new mongoose.Schema(
    {
        conn_id: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        lastmsg:{
            type: String,
        },
        type: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

chatconnection.set("toJSON", {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("ChatConnection", chatconnection);
