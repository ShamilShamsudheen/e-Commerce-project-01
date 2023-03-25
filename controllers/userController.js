const User = require('../models/userModel');
const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel')
const Order = require('../models/orderModel')
const Coupon = require('../models/couponModel')
const Banner = require('../models/bannerModel')
const Category = require('../models/categoryModel')
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const { ObjectId } = require('mongodb');
const crypto = require("crypto");
const { populate } = require('../models/couponModel');
require('dotenv').config();


const instance = new Razorpay({
    key_id: process.env.razorpayId,
    key_secret: process.env.rezorpayKey
});

const accountSid = process.env.twilioAccountSid;
const authToken = process.env.twilioAuthToken;
const verifySid = process.env.twilioVerifySid;
const client = require("twilio")(accountSid, authToken);


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        next(error);

    }
}

// registration page load part

const loadRegister = async (req, res,next) => {
    try {
        res.render('registration')
        // .then(() => readline.close());
    } catch (error) {

        next(error);
    }
};

// registration verification part 

const insertUser = async (req, res,next) => {
    try {
        const spassword = await securePassword(req.body.password)
        if (req.body.name.trim() === "") {
            res.render('registration', { errName: "Enter valid name.....!" })
        } else {
            const userData = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                password: spassword,
                // is_admin:0,                               
            });
            const emailUser = await User.findOne({ email: userData.email });
            console.log(spassword);
            if (emailUser) {
                res.render('registration', { errMessage: "Already email exist" })
            }
            else if (userData) {
                if (req.body.password === req.body.repassword) {
                    const user = await userData.save();
                    res.render('registration', { message: "Your registration has been sucessfully." })
                } else {
                    res.render('registration', { passwordErr: "Wrong password." })
                }


            } else {
                res.render('registration', { fMessage: "Your registration has been failed." })
            }
        }
    } catch (error) {
        next(error)

    }
}

//login page loading
const loginLoad = async (req, res,next) => {
    try {

        if (req.session.userLogged) {
            res.redirect('/home')
        } else {

            res.render('login')
        }


    } catch (error) {
        next(error);
    }
}

//verify login part
const verifiedLogin = async (req, res,next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.status == true) {
                    req.session.user_id = userData._id;
                    req.session.userLogged = true;

                    res.redirect('/home');
                } else {
                    res.render('login', { pMessage: "Your account is blocked by admin" })
                }
            } else {
                res.render('login', { pMessage: "incorrect password" })
            }
        } else {
            res.render('login', { pMessage: "Login Failed" })
        }
    } catch (error) {
        ;
        next(error);
    }
}

//load Home page part
const loadHome = async (req, res,next) => {
    try {
        const bannerData = await Banner.find({ status: "Active" })
        console.log(bannerData);
        console.log(req.session);
        if (req.session.userLogged) {

            const userData = await User.findById({ _id: req.session.user_id })
            res.render('home', { userData, bannerData });
        } else {
            res.render('home', { bannerData });
        }

    } catch (error) {
        next(error);
    }
}

//about page part
const loadAbout = async (req, res,next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        res.render('about', { userData })
    } catch (error) {
        next(error);
    }
}

//products page part
const loadProducts = async (req, res,next) => {
    try {
        const categoryData = await Category.find({})
        const productData = await Product.find({})
        
        if(req.session.user_id){
            const userData = await User.findOne({ _id: req.session.user_id })
            res.render('products', { productData, userData , categoryData})
        }else{
            res.render('products', { productData , categoryData})
        }
        
       
    } catch (error) {
        next(error);
    }
}

//single-products page part
const loadSingleproduct = async (req, res,next) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id })
        const id = req.query.id
        const productData = await Product.findById({ _id: id })
        console.log(productData.image);
        if(userData){
            if (productData) {

                res.render('single-product', { product: productData, userData });
            } else {
                res.redirect('/home')
            }
        }else{
            if (productData) {

                res.render('single-product', { product: productData});
            } else {
                res.redirect('/home')
            }
        }
        

    } catch (error) {
        next(error);
    }
}



// checkout page form part
const loadCheckOut = async (req, res,next) => {
    try {
        const userCart = await Cart.findOne({ userData: req.session.user_id })
        const userData = await User.findById({ _id: req.session.user_id })
        await Cart.updateOne({ userData: req.session.user_id }, {
            $unset: { coupon: "" }
        })
        const userAddress = userData.address
        const cartProducts = userCart.products
        console.log(userData.address);
        const { totalPrice } = cartProducts.reduce((acc, cur) => {
            acc.totalPrice += cur.price;
            return acc;
        }, { totalPrice: 0 })
        res.render('checkout', { userData, userAddress, totalPrice })
    } catch (error) {
        next(error);
    }
}

// OTP login page part
const loadOtp = async (req, res,next) => {
    try {
        res.render('login-otp')
    } catch (error) {
        next(error);
    }
}

// getOTP page part
const getOTP = async (req, res,next) => {
    try {
        req.session.number = req.body.mobileno
        client.verify.v2
            .services("VAd2b0c2758bc061c81b9c0a026e1b2da2")
            .verifications.create({ to: "+91" + req.body.mobileno, channel: "sms" })
            .then((verification) => {
                console.log(verification.status)
                console.log(req.session);
                res.redirect('/verify-otp')
            }
            )
    } catch (error) {
        next(error);
    }
}

const loadverifyOtp = async (req, res,next) => {
    try {
        res.render('verify-otp')
    } catch (error) {
        next(error);
    }
}

// otp verification part
const verifyOtp = async (req, res,next) => {
    try {
        const mobile = req.session.number
        const otp = req.body.otp;
        client.verify.v2
            .services("VAd2b0c2758bc061c81b9c0a026e1b2da2")
            .verificationChecks.create({ to: "+91" + mobile, code: otp })
            .then((verification_check) => {
                if (verification_check.status === "approved") {
                    console.log(verification_check.status)
                    req.session.user_id = req.session.number
                    req.session.userLogged = true
                    res.redirect('/home')
                } else {
                    res.render('verify-otp', { pMessage: "OTP incorrect" })
                }
            })
    }
    catch (error) {
        next(error);
    }
}

// logout part
const userLogout = async (req, res,next) => {
    try {
        req.session.userLogged = false;
        req.session.user_id = "";
        res.redirect('/')
    } catch (error) {
        next(error);
    }
}

//user profile page part
const loaduserProfile = async (req, res,next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        res.render('user-profile', { userData })
    } catch (error) {
        next(error)
    }
}

//change password page part
const changePassword = async (req, res,next) =>{
    try {

        const password = req.body.oldPassword;
        const userData = await User.findOne({ _id: req.session.user_id })
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                
                    const sPassword = await securePassword(req.body.newPassword)
                    await User.updateOne({ _id: req.session.user_id }, {$set:{ password: sPassword} })
                    res.redirect('/user-profile')
                
            } else {
                res.render('user-profile', { pMessage: "incorrect password" ,userData})
            }
        }
        
    } catch (error) {
        next(error)
    }
}

//d load cart page
const loadCart = async (req, res,next) => {
    try {
        const userCart = await Cart.findOne({ userData: req.session.user_id }).populate('products.productId')
        const userData = await User.findById({ _id: req.session.user_id })
        console.log(userCart);

        const cartProducts = userCart.products
        const userCartProductsId = cartProducts.map(values => values.productId)
        var products = await Product.aggregate([
            {
                $match: {
                    _id: { $in: userCartProductsId }
                }
            }, {
                $project: {
                    productName: 1,
                    image: 1,
                    price: 1,
                    cartOrder: { $indexOfArray: [userCartProductsId, "$_id"] }
                }
            },
            { $sort: { cartOrder: 1 } }
        ])
        const { totalPrice } = cartProducts.reduce((acc, cur) => {
            acc.totalPrice += cur.price;
            return acc;
        }, { totalPrice: 0 })
        console.log(cartProducts + "evde");
        res.render('pageCart', { cartProducts, products, userData, totalPrice, userCart })

    } catch (error) {
        next(error)
    }
}

// inser cart page
const addToCart = async (req, res,next) => {
    try {

        const productData = await Product.findById({ _id: req.query.id })
        const UserId = await Cart.findOne({ userData: req.session.user_id })
        console.log(typeof productData.price);
        const product = {
            productId: productData._id,
            price: productData.price,
            quantity: 1
        }
        if (UserId) {
            let proExit = UserId.products.findIndex(product => product.productId == req.query.id)
            console.log(proExit);
            if (proExit != -1) {
                await Cart.updateOne({ userData: req.session.user_id, 'products.productId': req.query.id },
                    {
                        $inc: { 'products.$.quantity': 1, 'products.$.price': productData.price }
                    })
                res.redirect('/pageCart')
            } else {
                await Cart.findByIdAndUpdate({ _id: UserId._id }, { $push: { products: product } })
                res.redirect('/pageCart')
            }
        } else {
            const cart = new Cart({
                products: product,
                userData: req.session.user_id,

            })
            const cartData = await cart.save();
            res.redirect('/pageCart')
        }
    } catch (error) {
        next(error);
    }
}

// address add to user profile page
const loaduserAddress = async (req, res,next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const userAddress = userData.address;
        res.render('user-address', { userData, userAddress })
    } catch (error) {
        next(error);
    }
}

// post address for user profile
const addAddress = async (req, res,next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })

        const userAddress = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobileNumber,
            country: req.body.country,
            state: req.body.state,
            address: req.body.address,
            landmark: req.body.landMark,
            pincode: req.body.pincode
        }
        await User.findByIdAndUpdate({ _id: req.session.user_id }, { $push: { address: userAddress } })

        const address = await new User({
            address: [userAddress]

        })
        res.redirect('/user-address')
    } catch (error) {
        next(error);
    }
}

// cart item delete part
const deleteCart = async (req, res,next) => {
    try {
        console.log('sdfgnmvdfghj')
        console.log(req.query.id)
        const cartData = await Cart.updateOne({ userData: req.session.user_id }, { $pull: { products: { _id: req.query.id } } })
        res.redirect('/pageCart')
    } catch (error) {
        next(error);
    }
}

// userAddress delete 
const deleteUserAddress = async (req, res,next) => {
    try {
        const id = req.query.id;

        const deleteAddress = await User.updateOne({ _id: req.session.user_id }, { $pull: { address: { _id: id } } })
        if (deleteAddress) {
            res.redirect('/user-address')
        }


    } catch (error) {
        next(error)
    }
}

// edit userAddress 
const editUserAddress = async (req, res,next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const id = req.query.id
        if (userData) {
            const editAddress = await User.findOne({ 'address._id': id }, { 'address.$': 1, _id: 0 })
            editAddress.address.forEach((value) => {
                let addressData = value
                console.log(addressData);
                res.render('edit-address', { editAddress: addressData, userData })
            })
        }
    } catch (error) {
        next(error);
    }
}

//update userAddress 
const updateUserAddress = async (req, res,next) => {
    try {
        const userAddress = await User.updateOne({ _id: req.session.user_id, 'address._id': req.body.id }, {
            $set: {
                'address.$.name': req.body.name,
                'address.$.email': req.body.email,
                'address.$.mobile': req.body.mobileNumber,
                'address.$.country': req.body.country,
                'address.$.state': req.body.state,
                'address.$.address': req.body.address,
                'address.$.landmark': req.body.landMark,
                'address.$.pincode': req.body.pincode
            }
        })
        res.redirect('/user-address')
    } catch (error) {
        next(error);
    }
}

// process to pay
const processToPay = async (req, res,next) => {
    try {
        console.log(req.body);
        res.render('payment-info', { userData })
    } catch (error) {
        next(error);
    }
}

// order details page
const addOrderDetails = async (req, res,next) => {
    try {
        const userCart = await Cart.findOne({ userData: req.session.user_id }).populate('products.productId')
        const couponData = await Coupon.findOne({ _id: userCart.coupon })
        const product = await userCart.products
        const userData = await User.findById({ _id: req.session.user_id })
        const { subTotal } = product.reduce((acc, cur) => {
            acc.subTotal += cur.price;
            return acc;
        }, { subTotal: 0 });
        let totalPrice=subTotal
        if (couponData) {

            if (couponData.type == "Percentage") {
                let couponPercentage = couponData.value
                let couponDiscount = couponPercentage / 100;
                let maxDiscount = couponData.maxDiscount;
                let discount = subTotal * couponDiscount;
                if (discount > maxDiscount) {
                    discount = maxDiscount;
                }
                totalPrice = subTotal - discount;
            } else {
                totalPrice = subTotal - couponData.value;
            }
        }
        const orderDetails = new Order({
            productDetails: product,
            userId: userData._id,
            addressId: req.body.address_id,
            totalPrice: totalPrice,
            status: "placed",
            payment: req.body.paymentMethod,
            paymentStatus: "Pending"
        })
        console.log(orderDetails)
        const orderData = await orderDetails.save();
        console.log(orderData);
        await Coupon.updateOne({ _id: userCart.coupon }, {
            $push: {
                usedUser: req.session.user_id
            }
        })
        await Coupon.updateOne({ _id: userCart.coupon  }, {
            $inc: {
                totalUsage: -1
            }
        })
        
        if (orderData.payment == "Razor pay") {
            instance.orders.create({
                amount: parseInt(totalPrice) * 100,
                currency: "INR",
                receipt: orderData._id.toString()
            }).then((orders) => {
                res.json({ order: orders })
            })
        }else{
            res.json({success:true})
        }

        
       
    } catch (error) {
        next(error);
    }

}

const loadOrderDetails = async (req, res,next) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const orderData = await Order.find({ userId: req.session.user_id }).sort({ date: -1 })
        console.log(orderData);

        res.render('order-details', { userData, orderData })
    } catch (error) {
        next(error);
    }
}

//cancel order 
const cancelOrder = async (req, res,next) => {
    try {
        console.log("ethifvghbhjfvghvbsdhgvh")
        console.log(req.query.id);
        await Order.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: "canceled" } })
        res.redirect('/order-details')
    } catch (error) {
        next(error);
    }
}

const changeQuantity = async (req, res,next) => {
    try {
        const { userData, productId, quantity, salePrice, id } = req.body;
        const cartData = await Cart.findOneAndUpdate({ userData: userData, 'products.productId': productId }, {
        })
        const product = cartData.products.find(item => item.productId == productId)

        const afterQuantity = product.quantity + Number(quantity);
        if (afterQuantity != 0) {
            if (quantity == 1) {
                await Cart.findOneAndUpdate({ userData: userData, 'products.productId': productId }, {
                    $inc: { 'products.$.quantity': quantity, 'products.$.price': salePrice }
                })
                res.json({ success: true })
            } else {

                await Cart.findOneAndUpdate({ userData: userData, 'products.productId': productId }, {
                    $inc: { 'products.$.quantity': quantity, 'products.$.price': -salePrice }
                })
                res.json({ success: false })
            }
        } else {
            const productDelete = await Cart.updateOne(
                { userId: req.session.loggedId },
                { $pull: { products: { productId: productId } } }
            )
            res.redirect('/cart')
        }
    } catch (error) {
        next(error);
    }
}
const verifyPayment = async (req, res,next) => {
    try {
        console.log(req.body);
        const { order, payment } = req.body;
        let hmac = crypto.createHmac('sha256', 'PK56Dojde9oVTsHKb2YXWfB7')
        hmac.update(payment.razorpay_order_id + '|' + payment.razorpay_payment_id)
        hmac = hmac.digest("hex")
        if (hmac == payment.razorpay_signature) {
            await Order.updateOne({ _id: order.receipt }, {
                $set: {
                    paymentStatus: 'Payed'
                }
            })
            res.json({ success: true })
        } else {
            await Order.updateOne({ _id: order.receipt }, {
                $set: {
                    paymentStatus: 'Failed'
                }
            })
            res.json({ success: false })
        }
    } catch (error) {
        next(error)
    }
}

// conformation payment page
const paymentConformation = async (req, res,next) =>{
    try {
        const cartData = await Cart.findOne({ userData: req.session.user_id }).populate('products.productId')
        const productIds = cartData.products
        productIds.forEach(async(product)=>{
            await Product.updateOne({_id:product.productId._id},{$inc:{stock:-(product.quantity)}})
        })
        
        console.log(productIds)
        await Cart.updateOne({ userData: req.session.user_id }, {
            $unset: {
                products: ''
            }
        })

        res.render('paymentConformation')
    } catch (error) {
        next (error)
    }
}

//apply coupon
const applyCoupon = async (req, res,next) => {
    try {
        const { couponCode } = req.body;
        const couponDetails = await Coupon.findOne({ code: couponCode })
        const coupounApplied = await Cart.findOne({ $and: [{ userData: req.session.user_id }, { coupon: { $exists: true, $ne: null } }] })
        if (!coupounApplied) {
            console.log(req.session.user_id)
            const cartData = await Cart.findOne({ userData: req.session.user_id })
            console.log(cartData)
            const product = await cartData.products
            const { totalPrice } = product.reduce((acc, cur) => {
                acc.totalPrice += cur.price;
                return acc;
            }, { totalPrice: 0 });
            if (couponDetails) {
                const userUsed = await Coupon.findOne({ $and: [{ usedUser: { $in: [req.session.user_id] } }, { code: couponCode }] })
                const expiryDate = new Date(couponDetails.expireDate);
                let currentDate = new Date();
                if (userUsed) {
                    res.json({ success: true, couponDetails: couponDetails, userUsed: true })
                } else if (couponDetails.totalUsage == 0) {
                    res.json({ success: true, couponDetails: couponDetails, totalUsageErr: true })
                } else if (expiryDate.getTime() < currentDate.getTime()) {
                    res.json({ success: true, couponDetails: couponDetails, expiryDateErr: true })
                } else if (couponDetails.minOrder >= totalPrice) {
                    res.json({ success: true, couponDetails: couponDetails, minOrderErr: true })
                } else {
                    res.json({ success: true, couponDetails: couponDetails })
                    await Cart.updateOne({ userData: req.session.user_id },
                        { $set: { coupon: couponDetails._id } }, { upsert: true })
                }
            } else {
                res.json({ success: false })
            }
        } else {
            res.json({ success: false, applied: true })
            await Cart.updateOne({ userData: req.session.user_id }, {
                $unset: { coupon: "" }
            })
        }
    } catch (error) {
        next(error);
    }
}

//whislist load
const loadWishlist = async (req, res,next) => {
    try {
        const userCart = await Wishlist.findOne({ userData: req.session.user_id }).populate('products.productId');
        const userData = await User.findOne({ _id: req.session.user_id })
        const wishList = userCart.products
        if (userData) {
            res.render('wishList', { userData, wishList ,userCart})
        }

    } catch (error) {
        next(error);
    }
}

//insert wishlist 
const insertWishlist = async (req, res,next) => {
    try {
        console.log(req.query.id)
        const productData = await Product.findById({ _id: req.query.id })
        const userId = await Wishlist.findOne({ userData: req.session.user_id })
        const product = {
            productId: productData._id,
        }
        if (userId) {
            let productExists = userId.products.findIndex(product => product.productId == req.query.id)
            if (productExists != -1) {
                const userData = await User.findOne({ _id: req.session.user_id })
                const productData = await Product.findById({})
                res.render('products', { message: "Already in wishlist", userData, productData })
            } else {
                await Wishlist.findByIdAndUpdate({ _id: userId._id }, { $push: { products: product } })
                res.redirect('/wishList');
            }

        } else {
            const data = new Wishlist({
                products: product,
                userData: req.session.user_id,
            })
            const cartData = await data.save()

            res.redirect('/wishList')
        }
    } catch (error) {
        next(error)
    }
}

// remove product from wishlist
const removeProduct = async (req, res,next) => {
    try {
        await Wishlist.updateOne({ userData: req.session.user_id, "products.productId": req.query.id }, { $pull: { products: { productId: req.query.id } } })
        res.redirect('/wishList')
    } catch (error) {
        next(error);
    }
}

//move to cart
const moveToCart = async (req, res,next) => {
    try {
        console.log("id:"+req.query.id)
        const productData = await Product.findById({ _id: req.query.id })
        const UserId = await Cart.findOne({ userData: req.session.user_id })
        const wishData = await Wishlist.findOne({ userData: req.session.user_id })

        const product = {
            productId: productData._id,
            quantity: 1,
            total: productData.salePrice
        }
        if (UserId) {
            let proExit = UserId.products.findIndex(product => product.productId == req.query.id)
            if (proExit != -1) {
                await Cart.updateOne({ userData: req.session.user_id, 'products.productId': req.query.id },
                    {
                        $inc: { 'products.$.quantity': 1, 'products.$.total': productData.salePrice, total: productData.salePrice }
                    })
                const remPro = wishData.products.findIndex(product => product.productId == req.query.id)
                wishData.products.splice(remPro, 1)

                await wishData.save()

                res.redirect('/pageCart')
            } else {
                await Cart.findByIdAndUpdate({ _id: UserId._id }, { $push: { products: product } })
                console.log(req.query.id);

                const remPro = wishData.products.findIndex(product => product.productId == req.query.id)
                wishData.products.splice(remPro, 1)

                await wishData.save()

                res.redirect('/pagecart')
            }
        } else {
            const cart = new Cart({
                products: product,
                userData: req.session.user_id,
                total: productData.salePrice
            })
            await cart.save()

            res.redirect('/pageCart')
        }
    } catch (error) {
        next(error)
        
    }
}

//filter Category post
const filterCategory =async (req, res,next) =>{
    try {
        const category=req.body.category
        const filterProduct = {}
        if(category){
            filterProduct.category={$in:category}
        }
        const filterCategory = await Product.find(filterProduct)
        console.log(filterCategory)
        res.json({ filterCategory })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    loadRegister,
    securePassword,
    insertUser,
    loginLoad,
    loadHome,
    verifiedLogin,
    loadAbout,
    loadProducts,
    loadSingleproduct,
    loadOtp,
    getOTP,
    verifyOtp,
    loadverifyOtp,
    userLogout,
    loadCart,
    addToCart,
    loadCheckOut,
    loaduserProfile,
    changePassword,
    loaduserAddress,
    addAddress,
    deleteCart,
    deleteUserAddress,
    editUserAddress,
    updateUserAddress,
    processToPay,
    addOrderDetails,
    loadOrderDetails,
    cancelOrder,
    changeQuantity,
    verifyPayment,
    paymentConformation,
    applyCoupon,
    loadWishlist,
    insertWishlist,
    removeProduct,
    moveToCart,
    filterCategory,
}