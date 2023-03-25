const express = require("express");
const user_route = express();
const session = require("express-session");

const config = require('../config/config');
user_route.use(session({secret:config.sessionSecret}));

const auth = require('../middleware/auth');


user_route.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })


user_route.set('views','./views/user')

// user_route.use(express.json())
// user_route.use(express.urlencoded({extended:true}))

const userController  = require("../controllers/userController");

user_route.get('/register',userController.loadRegister);
user_route.post('/register',userController.insertUser);

user_route.get('/',auth.isLogout,userController.loadHome)
user_route.get('/login',auth.isLogout,userController.loginLoad)

user_route.post('/',userController.verifiedLogin);
user_route.post('/login',userController.verifiedLogin);


user_route.get('/home',auth.isLogin,userController.loadHome);
user_route.get('/about',auth.isLogin,userController.loadAbout);
user_route.get('/products',userController.loadProducts);
user_route.get('/single-product',userController.loadSingleproduct);
user_route.get('/pageCart',auth.isLogin,userController.loadCart)
user_route.post('/changeQuantity',auth.isLogin,userController.changeQuantity)
user_route.get('/addToCart',auth.isLogin,userController.addToCart)
user_route.get('/deleteCart',auth.isLogin,userController.deleteCart)
user_route.get('/checkout',auth.isLogin,userController.loadCheckOut)

user_route.get('/wishList',auth.isLogin,userController.loadWishlist)
user_route.get('/addwishList',auth.isLogin,userController.insertWishlist)
user_route.get('/moveToCart',auth.isLogin,userController.moveToCart)
user_route.get('/deleteWishlist',auth.isLogin,userController.removeProduct)

user_route.get('/user-profile',auth.isLogin,userController.loaduserProfile);
user_route.post('/user-profile',auth.isLogin,userController.changePassword);             
user_route.get('/user-address',auth.isLogin,userController.loaduserAddress)
user_route.post('/user-address',auth.isLogin,userController.addAddress)
user_route.get('/delete-address',auth.isLogin,userController.deleteUserAddress)
user_route.get('/edit-address',auth.isLogin,userController.editUserAddress)
user_route.post('/edit-address',auth.isLogin,userController.updateUserAddress)

user_route.post('/checkout',userController.addOrderDetails)

user_route.post('/verifyPayment',userController.verifyPayment)
user_route.get('/paymentConformation',userController.paymentConformation)

user_route.post('/applyCoupon',userController.applyCoupon)
user_route.post('/filterCategory',userController.filterCategory)


user_route.get('/order-details',userController.loadOrderDetails)
user_route.get('/cancelOrder',userController.cancelOrder)

user_route.get('/login-otp',auth.isLogout,userController.loadOtp);
user_route.post('/login-otp',userController.getOTP);

user_route.get('/verify-otp',auth.isLogout,userController.loadverifyOtp);
user_route.post('/verify-otp',userController.verifyOtp);

user_route.get('/logout',auth.isLogin,userController.userLogout)



module.exports = user_route ; 