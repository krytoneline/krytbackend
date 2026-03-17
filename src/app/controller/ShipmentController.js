const mongoose = require("mongoose");
const alogisApi = require("../services/alogis.service");
const response = require("../responses");

const ProductRequest = mongoose.model("ProductRequest");

module.exports = {

  scheduleShipment: async (req, res) => {
    try {
      const { orderId } = req.body;

      const order = await ProductRequest.findById(orderId);

      if (!order) {
        return response.error(res, { message: "Order not found" });
      }

      if (order.shipmentId) {
        return response.error(res, {
          message: "Shipment already scheduled",
        });
      }

      let clientId = order.alogisClientId;

      if (!clientId) {
        const clientPayload = {
          name: order.shiping_address.firstName || "Customer",
          email: order.shiping_address.email || "test@gmail.com",
          phone: order.shiping_address.phoneNumber || "9999999999",
          address: order.shiping_address.address || "India",
        };

        const clientRes = await alogisApi.post("/clients", clientPayload);

        const clientURI = clientRes?.data?.["@id"]; // "/api/clients/45"

        clientId = clientURI.split("/").pop();

        order.alogisClientId = clientId;
      }

      const shipmentPayload = {
        destination: order.shiping_address.address || "India",
        origin: "Delhi Warehouse",
        weight: 2,
        description: "Customer Order",
        client: `/api/clients/${clientId}`,
      };

      const shipmentRes = await alogisApi.post("/shipments", shipmentPayload);

      const shipmentURI = shipmentRes?.data?.["@id"]; // "/api/shipments/120"

      const shipmentId = shipmentURI.split("/").pop();

      order.shipmentId = shipmentId;
      order.trackingNumber = shipmentRes?.data?.trackingNumber;
      order.Status = "Shipment Scheduled";

      await order.save();

      await alogisApi.post("/trackings", {
        shipmentStatus: "Pending",
        location: "Warehouse",
        note: "Shipment created",
        shipment: `/api/shipments/${shipmentId}`,
      });

      return response.ok(res, shipmentRes.data, {
        message: "Shipment scheduled successfully",
      });

    } catch (error) {
      console.log(error);

      return response.error(res, error.response?.data || error.message);
    }
  },

  createTracking: async (req, res) => {
    try {

      const payload = req.body;

      const result = await alogisApi.post("/trackings", payload);

      return response.ok(res, result.data);

    } catch (error) {

      return response.error(res, error.response?.data || error.message);

    }
  },

  // Get shipment details
  getShipmentDetails: async (req, res) => {
    try {

      const { id } = req.params;

      const result = await alogisApi.get(`/shipments/${id}`);

      return response.ok(res, result.data);

    } catch (error) {

      return response.error(res, error.response?.data || error.message);

    }
  },

};
