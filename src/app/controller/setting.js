const mongoose = require("mongoose");
const Setting = mongoose.model('Setting');
const User = mongoose.model('User');
const response = require("./../responses");

module.exports = {

    createSetting: async (req, res) => {
        try {


            const notify = new Setting(req.body)
            const noti = await notify.save();
            return res.status(201).json({
                success: true,
                message: 'Data Saved successfully!',
                data: noti
            })
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: e.message
            });
        }
    },

    getSetting: async (req, res) => {
        try {

            const notifications = await Setting.find({});

            res.status(200).json({
                success: true,
                message: 'Fetched all notification successfully',
                setting: notifications
            })

        } catch (e) {
            return res.status(500).json({
                success: false,
                message: e.message
            });
        }
    },

    updateSetting: async (req, res) => {
        try {
            const payload = req?.body || {};
            let category = await Setting.findByIdAndUpdate(payload?.id, payload, {
                new: true,
                upsert: true,
            });
            return res.status(200).json({
                success: true,
                message: 'Updated successfully',
                setting: category
            })
        } catch (error) {
            return response.error(res, error);
        }
    },

    chargeCPC:async(req, res)=>{
        try {
            // const product = await ProductRequest.findById(req.params.id).populate('user', '-password').populate('category product');
            let payload = req.body
            let com = await Setting.findOne();
            let seller = await User.findById(payload.seller)
            seller.wallet = (Number(seller.wallet) || 0 ) - Number(com.cpc)
            await seller.save();
            return response.ok(res, seller );
        } catch (error) {
            return response.error(res, error);
        }
    }

}