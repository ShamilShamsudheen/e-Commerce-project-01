const express = require("express");
const admin_route = express();

const session = require("express-session");
const config = require("../config/config");
admin_route.use(session({secret:config.adminsessionSecret}));




const auth =require('../middleware/adminAuth');

admin_route.set('views','./views/admin');


const bannerUpload =config.bannerUpload
const upload = config.upload;


const adminController = require("../controllers/adminController");

admin_route.get('/',auth.isLogout,adminController.loginLoad);
admin_route.post('/',adminController.verifiedLogin);

admin_route.get('/home',auth.isLogin,adminController.loadHome);
admin_route.get('/productlist',auth.isLogin,adminController.productList);

admin_route.get('/add-product',auth.isLogin,adminController.addProduct);
admin_route.post('/add-product',upload.array('image',5),adminController.insertProducts);
// admin_route.get('/delete-product',adminController.deleteProduct);
admin_route.get('/edit-product',auth.isLogin,adminController.editProduct);
admin_route.post('/update-product',upload.array('image',5),adminController.updateProducts);
admin_route.get('/enableProduct',auth.isLogin,adminController.enableProduct)
admin_route.get('/disableProduct',auth.isLogin,adminController.disableProduct)
admin_route.get('/delete-img',adminController.deleteImage)

admin_route.get('/logout',auth.isLogin,adminController.logout)
admin_route.get('/userDetails',auth.isLogin,adminController.userDetails)
admin_route.get('/blockUser',auth.isLogin,adminController.blockUser)
admin_route.get('/unblockUser',auth.isLogin,adminController.unblockUser)
admin_route.get('/category',auth.isLogin,adminController.loadCategory)
admin_route.get('/addCategory',auth.isLogin,adminController.loadaddCategory)
admin_route.post('/addCategory',auth.isLogin,adminController.insertCategory)
admin_route.get('/editCategory',auth.isLogin,adminController.editCategory)
admin_route.post('/editCategory',auth.isLogin,adminController.updateCategory)
admin_route.get('/enableCategory',auth.isLogin,adminController.enableCategory)
admin_route.get('/disableCategory',auth.isLogin,adminController.disableCategory)
admin_route.get('/deleteCategory',auth.isLogin,adminController.deleteCategory);
admin_route.get('/orderList',auth.isLogin,adminController.loadOrder);
admin_route.get('/orderDetails',auth.isLogin,adminController.orderDetails);
admin_route.post('/orderDetails',auth.isLogin,adminController.orderStatus);

admin_route.get('/couponList',auth.isLogin,adminController.loadCoupon);
admin_route.get('/addCoupon',auth.isLogin,adminController.addCoupon);
admin_route.post('/addCoupon',auth.isLogin,adminController.insertCoupon);
admin_route.get('/editCoupon',auth.isLogin,adminController.editCoupon);
admin_route.post('/updateCoupon',auth.isLogin,adminController.updateCoupon);

admin_route.get('/bannerList',auth.isLogin,adminController.loadBanner);
admin_route.get('/addBanner',auth.isLogin,adminController.addBanner);
admin_route.post('/addBanner',bannerUpload.array('image',1),adminController.insertBanner);
admin_route.post('/editBanner',bannerUpload.array('image',1),adminController.updateBanner);
admin_route.get('/editBanner',auth.isLogin,adminController.editBanner);
admin_route.get('/deleteBanner',auth.isLogin,adminController.deleteBanner)

admin_route.get('/salesReport',auth.isLogin,adminController.loadSalesReport)
admin_route.post('/filterReport',adminController.filterReport)
admin_route.post('/salesPdf',adminController.salesPdf)
admin_route.get ('/graphDetails',adminController.graphDetails)


admin_route.get('*',(req,res)=>{
    res.redirect('/admin');
});

module.exports= admin_route;