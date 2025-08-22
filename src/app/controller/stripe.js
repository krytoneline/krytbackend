const mongoose = require("mongoose");
const responseg = require("./../responses");
// import Stripe from "stripe";
const User = mongoose.model("User");
const Stripe = require("stripe")
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_API_SECRET_KEY);



module.exports = {
  poststripe: async (req, res) => {

    try {
      // const shipping = req.body.shipping  // for after pay
      const priceFormatStripe = Math.round(req.body.price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceFormatStripe,
        currency: req.body.currency,
        payment_method_types: ["card"],
        // shipping  // for after pay
      });
      console.log(paymentIntent)
      res.status(200).send({
        clientSecret: paymentIntent.client_secret,
        price: req.body.price,
        error: null,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, error: err.message });
    }
  },


};
