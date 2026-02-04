const mongoose = require("mongoose");
const Category = mongoose.model("Category");
const response = require("./../responses");
const mailNotification = require("../services/mailNotification1");

module.exports = {
  createCategory: async (req, res) => {
    try {
      const payload = req?.body || {};
      payload.posted_by = req.user.id;
      payload.slug = payload.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      let cat = new Category(payload);
      await cat.save();
      return response.ok(res, { message: "Category added successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getCategory: async (req, res) => {
    try {
      let cond = {};
      if (req.query.type) {
        cond.type = req.query.type;
      }
      let category = await Category.find(cond);
      return response.ok(res, category);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getPopularCategory: async (req, res) => {
    try {
      let category = await Category.aggregate([
        {
          $match: { popular: true },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "category",
            as: "products",
            pipeline: [
              {
                $limit: 2,
              },
              {
                $project: {
                  varients: { $arrayElemAt: ["$varients.image", 0] },
                },
              },
              {
                $project: {
                  image: { $arrayElemAt: ["$varients", 0] },
                },
              },
            ],
          },
        },
        {
          $project: {
            name: 1,
            image: 1,
            products: 1,
          },
        },
        {
          $limit: 3,
        },
      ]);
      return response.ok(res, category);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getCategoryById: async (req, res) => {
    try {
      let category = await Category.findById(req?.params?.id);
      return response.ok(res, category);
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateCategory: async (req, res) => {
    try {
      const payload = req?.body || {};
      if (payload.name) {
        payload.slug = payload.name
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, "");
      }
      let category = await Category.findByIdAndUpdate(payload?.id, payload, {
        new: true,
        upsert: true,
      });
      return response.ok(res, category);
    } catch (error) {
      return response.error(res, error);
    }
  },

  deleteCategory: async (req, res) => {
    try {
      await Category.findByIdAndDelete(req?.params?.id);
      return response.ok(res, { meaasge: "Deleted successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  deleteAllCategory: async (req, res) => {
    try {
      const newid = req.body.category.map(
        (f) => new mongoose.Types.ObjectId(f),
      );
      await Category.deleteMany({ _id: { $in: newid } });
      return response.ok(res, { meaasge: "Deleted successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

addSubcategory: async (req, res) => {
  try {
    const { name, categoryId, Attribute } = req.body;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    if (!name) {
      return res.status(400).json({
        message: "Subcategory name is required",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    category.Subcategory.push({
      name,
      Attribute: Attribute || [],
    });

    await category.save();

    return res.status(201).json({
      message: "Subcategory added successfully",
      subcategories: category.Subcategory,
    });
  } catch (error) {
    return response.error(res, error);
  }
},


  deleteSubcategory: async (req, res) => {
    try {
      const { categoryId, subId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      if (!mongoose.Types.ObjectId.isValid(subId)) {
        return res.status(400).json({ message: "Invalid subcategory ID" });
      }

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const subcategoryIndex = category.Subcategory.findIndex(
        (sub) => sub._id.toString() === subId,
      );
      if (subcategoryIndex === -1) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      category.Subcategory.splice(subcategoryIndex, 1);
      await category.save();

      return response.ok(res, { meaasge: "Subcategory deleted successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateSubcategory: async (req, res) => {
    try {
      const { name, categoryId, Attribute } = req.body;

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const subcategory = category.Subcategory.id(req.body._id);
      if (!subcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      subcategory.name = name;
      subcategory.Attribute = Attribute;
      await category.save();

      return response.ok(res, subcategory, {
        message: "Subcategory updated successfully",
      });
    } catch (error) {
      return response.error(res, error);
    }
  },
};
