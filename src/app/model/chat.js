"use strict";

const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema(
  {
    message: {
      type: String,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    connection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    msgtime: {
      type: Date,
      default: new Date(),
    },
    messageType:{
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

chatSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Chat", chatSchema);
