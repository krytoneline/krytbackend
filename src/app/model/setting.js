"use strict";

const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
    {
        carousel: [{
            type: String,
        }],
        commission:{
            type:Number,
            default:5
        },
        cpc:{
            type:Number,
            default:1
        },

    },
    {
        timestamps: true,
    }
);
settingSchema.set("toJSON", {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    },
});


module.exports = mongoose.model("Setting", settingSchema);
