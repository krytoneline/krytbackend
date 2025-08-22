"use strict";
const userHelper = require("./../helper/user");
const response = require("./../responses");
const passport = require("passport");
const jwtService = require("./../services/jwtService");
const mailNotification = require("./../services/mailNotification");
const mongoose = require("mongoose");
// const Device = mongoose.model("Device");
const User = mongoose.model("User");
const Getintouch = mongoose.model("Getintouch");
const Newsletter = mongoose.model("Newsletter");
const Store = mongoose.model("Store");
const Verification = mongoose.model("Verification");
const Notification = mongoose.model("Notification");
const Review = mongoose.model("Review");
const { v4: uuidv4 } = require("uuid");
const { default: axios } = require("axios");
const Transaction = mongoose.model('Transaction');
const WalletRequest = mongoose.model('WalletRequest');
const ChatConnection = mongoose.model("ChatConnection");

module.exports = {

createConnection:async(req, res)=>{
  try {
  const data = req.body
  let con = await ChatConnection.findOne({ conn_id: data.conn_id })
  if (!con) {
      const c = await ChatConnection.create(data)
      con = await ChatConnection.findOne({ conn_id: c.conn_id }).populate('user', 'username profile')
  }
  return response.ok(res, {Chatconnection:con} );
} catch (error) {
  return response.error(res, error);
}
},

  // login controller
  login: (req, res) => {
    console.log("request came here");
    passport.authenticate("local", async (err, user, info) => {
      if (err) {
        return response.error(res, err);
      }
      if (!user) {
        return response.unAuthorize(res, info);
      }
      let token = await new jwtService().createJwtToken({
        id: user._id,
        // user: user.fullName,
        type: user.type,
        tokenVersion: new Date(),
      });
      await user.save();
      let data = {
        token,
        ...user._doc,
      };
      if (user.type === 'SELLER') {
        let store = await Store.findOne({ userid: user._id })
        data.store = store
      }
      delete data.password;
      return response.ok(res, { ...data });
    })(req, res);
  },

  updateplaninuser: async (req, res) => {
    try {
      const newresponse = await User.findByIdAndUpdate(
        req.user.id,
        req.body,
        { new: true, upsert: true }
      );
      console.log("data updated");
      return response.ok(res, { message: "Subscribed Succesfully", newresponse });
    } catch { }
  },
  signUp: async (req, res) => {
    try {
      const payload = req.body;
      const mail = req.body.email;
      if (!mail) {
        return response.badReq(res, { message: "Email required." });
      }
      let user2 = await User.findOne({
        email: payload.email.toLowerCase(),
      });
      const user = await User.findOne({ number: payload.number });
      console.log(user)
      if (user) {
        return res.status(404).json({
          success: false,
          message: "Phone number already exists.",
        });
      }
      if (user2) {
        return res.status(404).json({
          success: false,
          message: "Email Id already exists.",
        });
      } else {
        let user = new User({
          username: payload?.username,
          email: payload?.email,
          number: payload?.number,
          type: payload?.type
        });
        user.password = user.encryptPassword(req.body.password);
        await user.save();
        await mailNotification.welcomeMail(user)
        res.status(200).json({ success: true, data: user });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },
  changePasswordProfile: async (req, res) => {
    try {
      let user = await User.findById(req.user.id);
      if (!user) {
        return response.notFound(res, { message: "User doesn't exists." });
      }
      user.password = user.encryptPassword(req.body.password);
      await user.save();
      mailNotification.passwordChange({ email: user.email });
      return response.ok(res, { message: "Password changed." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  me: async (req, res) => {
    try {
      let user = userHelper.find({ _id: req.user.id }).lean()
      return response.ok(res, user);
    } catch (error) {
      return response.error(res, error);
    }
  },
  updateUser: async (req, res) => {
    try {
      delete req.body.password;
      await User.updateOne({ _id: req.user.id }, { $set: req.body });
      return response.ok(res, { message: "Profile Updated." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  sendOTP: async (req, res) => {
    try {
      const email = req.body.email;
      const user = await User.findOne({ email });

      if (!user) {
        return response.badReq(res, { message: "Email does exist." });
      }
      // OTP is fixed for Now: 0000
      let ran_otp = Math.floor(1000 + Math.random() * 9000);
      await mailNotification.sendOTPmail({
        code: ran_otp,
        email: email
      });
      // let ran_otp = "0000";
      // if (
      //   !ver ||
      //   new Date().getTime() > new Date(ver.expiration_at).getTime()
      // ) {
      let ver = new Verification({
        //email: email,
        user: user._id,
        otp: ran_otp,
        expiration_at: userHelper.getDatewithAddedMinutes(5),
      });
      await ver.save();
      // }
      let token = await userHelper.encode(ver._id);

      return response.ok(res, { message: "OTP sent.", token });
    } catch (error) {
      return response.error(res, error);
    }
  },
  verifyOTP: async (req, res) => {
    try {
      const otp = req.body.otp;
      const token = req.body.token;
      if (!(otp && token)) {
        return response.badReq(res, { message: "otp and token required." });
      }
      let verId = await userHelper.decode(token);
      let ver = await Verification.findById(verId);
      if (
        otp == ver.otp &&
        !ver.verified &&
        new Date().getTime() < new Date(ver.expiration_at).getTime()
      ) {
        let token = await userHelper.encode(
          ver._id + ":" + userHelper.getDatewithAddedMinutes(5).getTime()
        );
        ver.verified = true;
        await ver.save();
        return response.ok(res, { message: "OTP verified", token });
      } else {
        return response.notFound(res, { message: "Invalid OTP" });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },
  changePassword: async (req, res) => {
    try {
      const token = req.body.token;
      const password = req.body.password;
      const data = await userHelper.decode(token);
      const [verID, date] = data.split(":");
      if (new Date().getTime() > new Date(date).getTime()) {
        return response.forbidden(res, { message: "Session expired." });
      }
      let otp = await Verification.findById(verID);
      if (!otp.verified) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      let user = await User.findById(otp.user);
      if (!user) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      await Verification.findByIdAndDelete(verID);
      user.password = user.encryptPassword(password);
      await user.save();
      //mailNotification.passwordChange({ email: user.email });
      return response.ok(res, { message: "Password changed ! Login now." });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getUserList: async (req, res) => {
    try {
      let user = await User.find({ type: req.params.type });
      return response.ok(res, user);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getSellerList: async (req, res) => {
    try {
      // let user = await User.find({ type: req.params.type });
      let cond ={}
      if(req.body.curDate){
        const newEt = new Date(new Date(req.body.curDate).setDate(new Date(req.body.curDate).getDate() + 1))
        cond.createdAt = { $gte: new Date(req.body.curDate), $lte: newEt };
      } 
      let user = await User.aggregate([
        {
          $match: cond
        },
        { $sort : { createdAt : -1 } },
        {
          $lookup: {
            from: 'stores',
            localField: '_id',
            foreignField: 'userid',
            as: 'store',
          }
        },
        {
          $unwind: {
            path: '$store',
            preserveNullAndEmptyArrays: true
          }
        },
      ])
      return response.ok(res, user);
    } catch (error) {
      return response.error(res, error);
    }
  },

  notification: async (req, res) => {
    try {
      let notifications = await Notification.find({ for: req.user.id })
        .populate({
          path: "invited_for",
          populate: { path: "job" },
        })
        .lean();
      return response.ok(res, { notifications });
    } catch (error) {
      return response.error(res, error);
    }
  },
  updateSettings: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user.id, { $set: req.body });
      return response.ok(res, { message: "Settings updated." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getSettings: async (req, res) => {
    try {
      const settings = await User.findById(req.user.id, {
        notification: 1,
        distance: 1,
      });
      return response.ok(res, { settings });
    } catch (error) {
      return response.error(res, error);
    }
  },

  allOrganization: async (req, res) => {
    try {
      const users = await userHelper.findAll({ isOrganization: true }).lean();
      return response.ok(res, { users });
    } catch (error) {
      return response.error(res, error);
    }
  },

  guardListSearch: async (req, res) => {
    try {
      const cond = {
        type: "PROVIDER",
        $or: [
          { username: { $regex: req.body.search } },
          { email: { $regex: req.body.search } },
        ],
      };
      let guards = await User.find(cond).lean();
      return response.ok(res, { guards });
    } catch (error) {
      return response.error(res, error);
    }
  },

  verifyGuard: async (req, res) => {
    try {
      await User.updateOne(
        { email: req.body.email },
        { $set: { verified: req.body.verified } }
      );
      return response.ok(res, {
        message: req.body.verified ? "Guard Verified." : "Guard Suspended.",
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getStaffList: async (req, res) => {
    try {
      //let cond = { type: 'PROVIDER'};
      let guards = await User.find({ type: "PROVIDER" }, { username: 1 });
      return response.ok(res, { guards });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getProfile: async (req, res) => {
    try {
      const u = await User.findById(req.user.id, '-password');
      return response.ok(res, u);
    } catch (error) {
      return response.error(res, error);
    }
  },
  updateProfile: async (req, res) => {
    const payload = req.body;
    const userId = req?.body?.userId || req.user.id
    try {
      // const data = await User.findByIdAndUpdate(userId, payload, { new: true, upsert: true })
      // return response.ok(res, data);
      // let userDetail = await User.findById(userId);
      // console.log(userDetail.number, req.body.number)
      // if (req.body.number && userDetail.number !== req.body.number && !req.body.otp) {
      //   let u = await User.findOne({ number: req.body.number });
      //   if (u) {
      //     return response.conflict(res, { message: "Phone Number already exist." });
      //   }
      //   // await sendOtp.sendOtp(req.body.phone)
      //   // let ran_otp = Math.floor(1000 + Math.random() * 9000);
      //   let ran_otp = '0000';
      //   // const data = req.body;
      //   const newPoll = new Verification({
      //     phone: req.body.phone,
      //     otp: ran_otp,
      //     expiration_at: userHelper.getDatewithAddedMinutes(5),
      //   });
      //   await newPoll.save();
      //   return response.ok(res, { otp: true, message: "OTP sent to your phone number" });
      // } else {
      // if (payload.otp) {
      //   let ver = await Verification.findOne({ phone: payload.phone });
      //   console.log(ver)
      //   if (payload.otp === ver.otp &&
      //     !ver.verified &&
      //     new Date().getTime() < new Date(ver.expiration_at).getTime()) {
      //     const u = await User.findByIdAndUpdate(
      //       userId,
      //       { $set: payload },
      //       {
      //         new: true,
      //         upsert: true,
      //       }
      //     );
      //     // let token = await new jwtService().createJwtToken({
      //     //   id: u._id,
      //     //   type: u.type,
      //     // });
      //     const data = {
      //       // token,
      //       ...u._doc,
      //     };
      //     delete data.password;
      //     await Verification.findOneAndDelete({ phone: payload.phone });
      //     return response.ok(res, data);

      //   } else {
      //     return res.status(404).json({ success: false, message: "Invalid OTP" });
      //   }
      // } else {

      // if (req.query.for === 'bankdetail') {
      //   let user = await User.findById(userId)
      //   const accountdata = await addAccount(user, payload)
      //   if (accountdata.status) {
      //     user.razorpay_bankaccount_id = accountdata.data.id
      //     if (accountdata.storeContactid) {
      //       user.razorpay_contact_id = accountdata.data.contact_id
      //     }
      //     await user.save();
      //   }
      // }
      const u = await User.findByIdAndUpdate(
        userId,
        { $set: payload },
        {
          new: true,
          upsert: true,
        }
      );
      let token = await new jwtService().createJwtToken({
        id: u._id,
        type: u.type,
      });
      const data = {
        token,
        ...u._doc,
      };
      delete data.password;
      // await Verification.findOneAndDelete({ phone: payload.phone });
      return response.ok(res, data);
      // }


      // }
    } catch (error) {
      return response.error(res, error);
    }
  },

  fileUpload: async (req, res) => {
    try {
      let key = req.file && req.file.key;
      return response.ok(res, {
        message: "File uploaded.",
        file: `${process.env.ASSET_ROOT}/${key}`,
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  createGetInTouch: async (req, res) => {
    try {
      const payload = req?.body || {};
      let getintouch = new Getintouch(payload);
      // await mailNotification.supportmail(payload)
      const blg = await getintouch.save();
      return response.ok(res, blg);
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateGetInTouch: async (req, res) => {
    try {
      await Getintouch.findByIdAndUpdate(req.params.id, { read: true });
      return response.ok(res, { message: 'read' });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getGetInTouch: async (req, res) => {
    try {
      let cond ={}
      if(req.body.curDate){
        const newEt = new Date(new Date(req.body.curDate).setDate(new Date(req.body.curDate).getDate() + 1))
        cond.createdAt = { $gte: new Date(req.body.curDate), $lte: newEt };
      }
      let blog = await Getintouch.find(cond).sort({ createdAt: -1 });
      return response.ok(res, blog);
    } catch (error) {
      return response.error(res, error);
    }
  },

  deleteGetInTouch: async (req, res) => {
    try {
      let blog = await Getintouch.findByIdAndDelete(req.params.id)
      return response.ok(res, { message: 'Deleted successfully' });
    } catch (error) {
      return response.error(res, error);
    }
  },
  addNewsLetter: async (req, res) => {
    try {
      const payload = req?.body || {};
      const u = await Newsletter.find(payload);
      if (u.length > 0) {
        return response.conflict(res, {
          message: "Email already exists.",
        });
      } else {
        let news = new Newsletter(payload);
        const newsl = await news.save();
        return response.ok(res, { message: "Subscried successfully" });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },

  getNewsLetter: async (req, res) => {
    try {
      let news = await Newsletter.find();
      return response.ok(res, news);
    } catch (error) {
      return response.error(res, error);
    }
  },

  DeleteNewsLetter: async (req, res) => {
    try {
      let news = await Newsletter.findByIdAndDelete(req.body.id);
      return response.ok(res, { message: 'Deleted successfully' });
    } catch (error) {
      return response.error(res, error);
    }
  },

  giverate: async (req, res) => {
    console.log(req.body);
    try {
      let payload = req.body;
      let cond = {
        posted_by: req.user.id,
      }
      if(payload.seller){
        cond.seller=payload.seller
      }else{
        cond.product = payload.product
      }
      const re = await Review.findOne(cond);
      
      if (re) {
        re.description = payload.description;
        re.rating = payload.rating;
        await re.save();
      } else {
        payload.posted_by = req.user.id;
        const u = new Review(payload);
        await u.save();
      }

      return response.ok(res, { message: "successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getReview: async (req, res) => {
    try {
      const cond = {}
      if (req.params.id) {
        cond.user = req.params.id
      }
      const allreview = await Review.find(cond)
        .populate("posted_by user", "-password")
      res.status(200).json({
        success: true,
        data: allreview,
      });
      // });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  getTransaction: async (req, res) => {
    try {
      const allTransaction = await Transaction.find({userid:req.user.id}).sort({"createdAt":-1})
      res.status(200).json({
        success: true,
        data: allTransaction,
      });
      // });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  createWalletRequest: async (req, res) => {
    try {
      req.body.userid=req.user.id
      const u = await User.findById(req.user.id)
      if(u.wallet < req.body.amount){
        return res.status(400).json({
          success: false,
          message: "Insufficient funds. Please check your balance and try again.",
        });
      }
      const allTransaction = await WalletRequest.create(req.body);

      res.status(200).json({
        success: true,
        data: allTransaction,
      });
      // });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  getWalletRequest: async (req, res) => {
    try {
      const cond ={}
      if(req.user.type === 'SELLER'){
        cond.userid= req.user.id
      }
      const allTransaction = await WalletRequest.find(cond).populate('userid','wallet').sort({'createdAt':-1})
      res.status(200).json({
        success: true,
        data: allTransaction,
      });
      // });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },


  UpdateWalletStatus: async (req, res) => {
    try {
      const payload = req.body
      const allTransaction = await WalletRequest.findByIdAndUpdate(payload.request_id,{status:payload.status})
      const user = await User.findById(allTransaction.userid);
      user.wallet = (Number(user.wallet) || 0 ) - Number(allTransaction.amount)
      await user.save();
      await Transaction.create({
        userType: 'SELLER',
        notification: `${allTransaction.amount} amount debited from you wallet to transfer your require bank`,
        transactionType: 'DEBIT',
        userid: allTransaction.userid,
        amount:Number(allTransaction.amount),
    })
  
    res.status(200).json({
      success: true,
      data: allTransaction,
    });
      // });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  deleteWalletRequest: async (req, res) => {
    try {
      const payload = req.body
      const allTransaction = await WalletRequest.findByIdAndDelete(payload.request_id);
      res.status(200).json({
        success: true,
        data: allTransaction,
      });
      // });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  getIp: async (req, res) => {
    try {
      const ress = await axios.get("https://ipinfo.io?token=c8ac68e6bdb4a8");
      console.log(ress.data);
      return response.ok(res, ress.data);
    } catch (error) {
      return response.error(res, error);
    }
  },
};
