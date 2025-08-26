const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  return new Promise((resolve, reject) => {
    const mailConfigurations = {
      from: `KRYT Online <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    };
    transporter.sendMail(mailConfigurations, function (error, info) {
      if (error) return reject(error);
      return resolve(info);
    });
  });
};

module.exports = {
  welcomeMail: async (username) => {
    try {
      console.log("Sending welcome email to:", username.email);

      const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #e0e0e0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #F38529;">Welcome to KRYT Online!</h2>
            <p style="color: #777; font-size: 14px;">We're glad to have you on board</p>
          </div>

          <p>Dear ${username.username},</p>

          <p>Thank you for creating your account at <strong>KRYT Online</strong>. We’re excited to be your trusted destination for quality products and service.</p>

          <p><strong>Your registered email:</strong> ${username.email}</p>

          <div style="background-color: #fef1e8; padding: 15px; border-left: 4px solid #F38529; margin: 20px 0; border-radius: 3px;">
            <p style="margin: 0;">Enjoy a seamless shopping experience with our commitment to quality and customer satisfaction.</p>
          </div>

          <p>If you have any questions, feel free to reach out to us. We're here to help!</p>

          <p style="margin-top: 20px;">Best regards,<br/><strong style="color: #F38529;">The KRYT Online Team</strong></p>

          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #777; text-align: center;">
            <p>This is a system-generated email. Please do not reply to this message.</p>
          </div>
        </div>
      </div>
    `;

      await sendMail(username.email, "Welcome to KRYT Online!", html);
    } catch (err) {
      console.error("Error sending welcome email:", err);
      throw new Error("Failed to send welcome email");
    }
  },

  sendOTPmail: async ({ email, code }) => {
    console.log(email, code);
    try {
      const html = `<div> \r\n<p>Hello,<\/p>\r\n\r\n<p> Welcome to <strong>
      KRYT Online </strong>. <\/p>\r\n\r\n<p>Your One-Time password  code is: <strong>${code}</strong>. This passcode will expire in 5 minutes<\/p>\r\n<\/br>Thanks,<\/p>\r\n\r\n<p><b>
      The KRYT Online Account Team<\/b><\/p><\/div>`;

      return await sendMail(email, "Password Reset Instructions", html);
    } catch (err) {
      console.log(err);
      throw new Error("Could not send OTP mail");
    }
  },

  passwordChange: async ({ email }) => {
    try {
      const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #333;">Password Reset Notification</h2>
          <p>Hello ${email},</p>
          <p>This is to inform you that your password has been reset.</p>
  
          <p>If you didn’t make this change or believe it was unauthorized, please contact support immediately.</p>
  
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
          <p style="font-size: 12px; color: #aaa;">&copy; ${new Date().getFullYear()} KRYT Online Team . All rights reserved.</p>
        </div> `;
      return await sendMail(email, "PASSWORD RESET NOTIFICATION EMAIL", html);
    } catch (err) {
      throw new Error("Could not send OTP mail");
    }
  },

  order: async ({ email, orderId }) => {
    try {
      const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #F38529;">Thank You for Your Order</h2>
          <p>Hello,</p>
          <p>Thank you for placing your order with us!</p>
          <p>Order ID: <strong>${orderId}</strong></p>
         
          <p style="margin-top: 20px;">
            Now just sit back and relax while we get to work. We’ll reach out soon to let you know via email your order is ready for pickup/delivery/shipping.
          </p>
           <p>We appreciate your business and look forward to serving you again!</p>
          <p style="margin-top: 30px;">Best regards,</p>
          <p><strong style="color: #F38529;">KRYT Online Team</strong></p>
        </div>
      </div>
    `;
      return await sendMail(
        email,
        `Thank You for Your Order – Order ID: ${orderId}`,
        html
      );
    } catch (err) {
      console.error("Error sending email:", err);
      throw new Error("Could not send Notifications");
    }
  },

  orderCancel: async ({ email, orderId }) => {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #e0e0e0;">
            <h2 style="color: #F38529;">Order Cancelled</h2>
            <p>Hello,</p>
            <p>Your order with Order ID: <strong>${orderId}</strong> has been successfully cancelled.</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #fef1e8; border-left: 4px solid #F38529;">
              <p><strong style="color: #F38529;">Address:</strong> 11360 Bellaire Blvd Suite 700,<br/>
              Houston, TX 77072<br/>
              <strong style="color: #F38529;">Phone:</strong> 832-230-9288</p>
            </div>
            <p style="margin-top: 30px;">If you have any questions, feel free to reach out to us.</p>
            <p><strong style="color: #F38529;">Bach Hoa Houston Team</strong></p>
          </div>
        </div>
      `;
      return await sendMail(
        email,
        `Order Cancelled - Order ID: ${orderId}`,
        html
      );
    } catch (err) {
      console.error("Error sending email:", err);
      throw new Error("Could not send Notifications");
    }
  },

  orderCancelAdmin: async ({ email, orderId }) => {
    try {
      const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #F38529;">Order Cancellation Notice</h2>
          <p>Dear Admin,</p>
          <p>The customer with email <strong>${email}</strong> has cancelled their order.</p>
          <p>Order ID: <strong>${orderId}</strong></p>
          <p>Please update the system accordingly.</p>
          <p style="margin-top: 30px;">Regards,<br/>System Notification</p>
        </div>
      </div>
    `;
      return await sendMail(
        process.env.MAIL_USER,
        `Order Cancelled by Customer – Order ID: ${orderId}`,
        html
      );
    } catch (err) {
      console.error("Error sending email:", err);
      throw new Error("Could not send Notifications");
    }
  },

  MessageToCustomer: async ({ customerEmail, message }) => {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #e0e0e0;">
            <h2 style="color: #F38529;">Message from Bach Hoa Houston Team</h2>
            <p>Dear Customer,</p>
            <p>${message}</p>
  
            <div style="margin-top: 20px; padding: 15px; background-color: #fef1e8; border-left: 4px solid #F38529;">
              <p><strong style="color: #F38529;">Address:</strong> 11360 Bellaire Blvd Suite 700,<br/>
              Houston, TX 77072<br/>
             <strong style="color: #F38529;">Phone:</strong> 832-230-9288</p></p>
              
            </div>
  
            <p style="margin-top: 30px;">If you have any questions, feel free to contact our support.</p>
            <p>Best regards,<br/><strong style="color: #F38529;>Bach Hoa Houston Team</strong></p>
          </div>
        </div>
      `;

      return await sendMail(
        customerEmail,
        "Message from Bach Hoa Houston Team",
        html
      );
    } catch (err) {
      console.error("Error sending email to customer:", err);
      throw new Error("Could not send email to customer");
    }
  },

  orderDelivered: async ({ email, orderId }) => {
    try {
      const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #F38529;">Order Delivered Successfully</h2>
          <p>Hello,</p>
          <p>We're happy to let you know that your order with Order ID: <strong>${orderId}</strong> has been <strong>successfully delivered</strong>.</p>

          <div style="margin-top: 20px; padding: 15px; background-color: #fef1e8; border-left: 4px solid #F38529;">
            <p><strong>Need Help?</strong></p>
            <ul>
              <li>If you notice any issue with your order, please reply to this email within <strong>24 hours</strong> of delivery.</li>
              <li>Attach any relevant <strong>photos or videos</strong> to help us resolve your issue quickly.</li>
              <li><strong>Note:</strong> We do not accept returns for food items, as per our policy.</li>
            </ul>
          </div>

          <p style="margin-top: 20px;">Thank you for shopping with us. We hope you enjoy your purchase!</p>
          <p>For more details, you can always refer to our <a href="https://www.bachhoahouston.com/ReturnPolicy" style="color: #F38529;">Return Policy</a>.</p>

          <div style="margin-top: 30px; padding: 15px; background-color: #fef1e8; border-left: 4px solid #F38529;">
            <p><strong style="color: #F38529;">Address:</strong> 11360 Bellaire Blvd Suite 700,<br/>
            Houston, TX 77072<br/>
            <strong style="color: #F38529;">Phone:</strong> 832-230-9288</p>
          </div>

          <p style="margin-top: 30px;"><strong style="color: #F38529;">Bach Hoa Houston Team</strong></p>
        </div>
      </div>
    `;
      return await sendMail(
        email,
        `Your Order Has Been Delivered - Order ID: ${orderId}`,
        html
      );
    } catch (err) {
      console.error("Error sending delivery email:", err);
      throw new Error("Could not send Notifications");
    }
  },

  orderCancelByAdmin: async ({ email, orderId, reason }) => {
    try {
      const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #F38529;">Order Cancelled by Admin</h2>
          <p>Hello,</p>
          <p>Your order with Order ID: <strong>${orderId}</strong> has been cancelled by our team.</p>

          <div style="margin-top: 15px; padding: 15px; background-color: #fef1e8; border-left: 4px solid #F38529;">
            <p><strong style="color: #F38529;">Reason for Cancellation:</strong><br/>${reason}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #fef1e8; border-left: 4px solid #F38529;">
            <p><strong style="color: #F38529;">Address:</strong> 11360 Bellaire Blvd Suite 700,<br/>
            Houston, TX 77072<br/>
            <strong style="color: #F38529;">Phone:</strong> 832-230-9288</p>
          </div>

          <p style="margin-top: 30px;">If you have any questions, feel free to reach out to us.</p>
          <p><strong style="color: #F38529;">Bach Hoa Houston Team</strong></p>
        </div>
      </div>
    `;

      return await sendMail(
        email,
        `Order Cancelled by Admin - Order ID: ${orderId}`,
        html
      );
    } catch (err) {
      console.error("Error sending email:", err);
      throw new Error("Could not send admin cancellation email");
    }
  },

  MessageToAllCustomer: async ({ customerEmail, message }) => {
    try {
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #e0e0e0;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #F38529; margin-bottom: 5px;">Important Announcement</h2>
              <p style="color: #777; font-size: 14px;">${currentDate}</p>
            </div>
            
            <p>Dear Valued Customer,</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="line-height: 1.6;">${message}</p>
            </div>
            
            <div style="margin-top: 25px; padding: 15px; background-color: #fef1e8; border-left: 4px solid #F38529; border-radius: 3px;">
              <p style="margin: 0;"><strong style="color: #F38529;">Visit Us:</strong> 11360 Bellaire Blvd Suite 700, Houston, TX 77072</p>
              <p style="margin: 10px 0 0;"><strong style="color: #F38529;">Call Us:</strong> 832-230-9288</p>
            </div>
            
            <p style="margin-top: 25px;">Thank you for being our customer. If you have any questions, please don't hesitate to contact us.</p>
            
            <p style="margin-top: 20px;">Best regards,<br/><strong style="color: #F38529;">Bach Hoa Houston Team</strong></p>
            
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #777; text-align: center;">
              <p>This is a system-generated email. Please do not reply to this message.</p>
            </div>
          </div>
        </div>
      `;

      return await sendMail(
        customerEmail,
        "Important Announcement from Bach Hoa Houston",
        html
      );
    } catch (err) {
      console.error("Error sending bulk email:", err);
      throw new Error("Failed to send announcement email");
    }
  },
};
