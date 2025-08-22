"use strict";
const router = require("express").Router();
const user = require("../../app/controller/user");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const blog = require("../../app/controller/blogs");
const category = require("../../app/controller/category");
const product = require("../../app/controller/product");
const { upload } = require("../../app/services/fileUpload");
const setting = require("../../app/controller/setting");
const theme = require("../../app/controller/theme");
const { getStoreById } = require("../../app/controller/store");
const store = require("../../app/controller/store");
const favourite = require("../../app/controller/favourite");
const stripe = require("../../app/controller/stripe");
const plan = require("../../app/controller/plan");
const content = require("../../app/controller/content");
const faq = require("../../app/controller/faq");


router.post("/createConnection", user.createConnection);
router.post("/login", user.login);
router.post("/signUp", user.signUp);
router.post("/sendOTP", user.sendOTP);
router.post("/verifyOTP", user.verifyOTP);
router.post("/changePassword", user.changePassword);
router.post(
    "/user/fileupload",
    upload.single("file"),
    user.fileUpload
);
router.get("/getuserlist/:type", isAuthenticated(["USER", "ADMIN", "SELLER"]), user.getUserList);
router.post("/getSellerList", isAuthenticated(["USER", "ADMIN", "SELLER"]), user.getSellerList);
router.post("/getInTouch", user.createGetInTouch);
router.get("/getInTouch/:id", user.updateGetInTouch);
router.post("/get-getInTouch", user.getGetInTouch);
router.delete("/user/delgetintouch/:id", user.deleteGetInTouch);

router.post("/add-subscriber", user.addNewsLetter);
router.get("/get-subscriber", user.getNewsLetter);
router.post("/del-subscriber", user.DeleteNewsLetter);

router.get("/userip", user.getIp);

router.put("/updateplaninuser", isAuthenticated(["SELLER"]), user.updateplaninuser);
router.post(
  "/profile/changePassword",
  isAuthenticated(["USER", "ADMIN","SELLER"]),
  user.changePasswordProfile
);

router.get("/getProfile", isAuthenticated(["USER", "ADMIN", "SELLER"]), user.getProfile);
router.post("/updateProfile", isAuthenticated(["USER", "ADMIN", "SELLER"]), user.updateProfile);

//transaction && wallet Request
router.get("/getTransaction", isAuthenticated(["USER", "ADMIN", "SELLER"]), user.getTransaction);
router.post("/createWalletRequest", isAuthenticated(["USER", "ADMIN", "SELLER"]), user.createWalletRequest);
router.post("/UpdateWalletStatus", isAuthenticated(["USER", "ADMIN", "SELLER"]), user.UpdateWalletStatus);
router.post("/deleteWalletRequest", isAuthenticated(["USER", "ADMIN", "SELLER"]), user.deleteWalletRequest);
router.get("/getWalletRequest", isAuthenticated(["USER", "ADMIN", "SELLER"]), user.getWalletRequest);


//blogs
router.get("/getblogcategory", blog.getBloggCategory);
router.post(
    "/create-blog",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    blog.createBlog
);
router.get("/get-blog", blog.getBlog);
router.post(
    "/update-blog",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    blog.updateBlog
);
router.post("/getBlogById", blog.getBlogById);
router.post("/getBlogByCategory", blog.getBlogByCategory);
router.delete(
    "/delete-blog",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    blog.deleteBlog
);

//Category
router.get("/getCategoryById/:id", category.getCategoryById);
router.post(
    "/createCategory",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    category.createCategory
);
router.get("/getCategory", category.getCategory);
router.get("/getPopularCategory", category.getPopularCategory);
router.post(
    "/updateCategory",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    category.updateCategory
);
router.delete(
    "/deleteCategory/:id",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    category.deleteCategory
);
router.post(
    "/deleteAllCategory",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    category.deleteAllCategory
);


//Theme
router.get("/getThemeById/:id", theme.getThemeById);
router.post(
    "/createTheme",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    theme.createTheme
);
router.get("/getTheme", theme.getTheme);
router.post(
    "/updateTheme",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    theme.updateTheme
);
router.delete(
    "/deleteTheme/:id",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    theme.deleteTheme
);
router.post(
    "/deleteAllCategory",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    theme.deleteAllTheme
);

//Product
router.get("/getProductById/:id", product.getProductById);
router.get("/getProductByslug/:id", product.getProductByslug);
router.post("/compareProduct", product.compareProduct);
router.get("/getProductBycategoryId", product.getProductBycategoryId);
router.get("/getProductBythemeId/:id", product.getProductBythemeId);
router.post(
    "/createProduct",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    product.createProduct
);
router.get("/getProduct", product.getProduct);
router.get("/getSponseredProduct", product.getSponseredProduct);

router.post(
    "/updateProduct",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    product.updateProduct
);

router.get(
    "/topselling",
    // isAuthenticated(["USER", "ADMIN","SELLER"]),
    product.topselling
);

router.get(
    "/getnewitem",
    // isAuthenticated(["USER", "ADMIN","SELLER"]),
    product.getnewitem
);

router.get(
    "/getcolors",
    // isAuthenticated(["USER", "ADMIN","SELLER"]),
    product.getColors
);

router.delete(
    "/deleteProduct/:id",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    product.deleteProduct
);
router.post(
    "/deleteAllProduct",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    product.deleteAllProduct
);


//Store
router.get("/getStoreById/:id", store.getStoreById);
router.post(
    "/createStore",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    store.createStore
);
router.get("/getStore", isAuthenticated(["USER", "ADMIN", "SELLER"]), store.getStore);
router.post(
    "/updateStore",
    isAuthenticated(["ADMIN", "SELLER"]),
    store.updateStore
);

router.delete(
    "/deleteStore/:id",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    store.deleteStore
);
router.post(
    "/deleteAllStore",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    store.deleteAllStore
);

/// setting
router.post("/createsetting", setting.createSetting);
router.get("/getsetting", setting.getSetting);
router.post(
    "/updatesetting",
    setting.updateSetting)

    router.post(
        "/chargeCPC",
        setting.chargeCPC)


// product request
router.post(
    "/createProductRquest",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    product.requestProduct
);

router.get(
    "/getProductRquest",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    product.getrequestProduct
);

router.post(
    "/getOrderBySeller",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    product.getOrderBySeller
);

router.get(
    "/productsearch",
    product.productSearch
);

router.post(
    "/updateProductRequest/:id",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    product.updaterequestProduct
);

router.get(
    "/getProductRequest/:id",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    product.getrequestProductbyid
);

router.get(
    "/getProductRequestbyUser",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    product.getrequestProductbyuser
);


//Favourite

router.post(
    "/addremovefavourite",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    favourite.AddFavourite
);

router.get(
    "/getFavourite",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    favourite.getFavourite
);


//Review
router.post(
    "/giverate",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    user.giverate
);

router.get(
    "/getReview",
    isAuthenticated(["USER", "ADMIN", "SELLER"]),
    user.getReview
);

router.post("/poststripe", isAuthenticated(["USER", "ADMIN", "SELLER"]), stripe.poststripe);

//plan
router.post("/postplan", plan.postplan);
router.get("/getallplan", plan.getallplan);
router.put("/updateplan/:id", plan.updateplan);
router.delete("/deleteplan/:id", plan.deleteplan);

//content
router.post("/content", isAuthenticated(["ADMIN"]), content.create);
router.get("/content", content.getContent);

//FAQ
router.post("/faq", isAuthenticated(["ADMIN"]), faq.create);
router.delete("/deletfaq/:id", isAuthenticated(["ADMIN"]), faq.delete);
router.post("/updatefaq/:id", isAuthenticated(["ADMIN"]), faq.update);
router.get("/faq", faq.getFAQ);

module.exports = router;
