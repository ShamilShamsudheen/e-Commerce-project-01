const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Products = require('../models/productModel');
const Category = require('../models/categoryModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Banner = require('../models/bannerModel');
const bcrypt = require("bcrypt");
const ejs =require('ejs');
const fs = require('fs');
const path = require('path');
const excelJS = require('exceljs')
const moment = require('moment');
const sharp =require('sharp');



// login load page
const loginLoad = async (req, res,next) => {
    try {
        res.render('login')
    } catch (error) {
        next(error);
    }
}

// verify load page
const verifiedLogin = async (req, res,next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const adminData = await Admin.findOne({ email: email });

        if (adminData) {
            const passwordMatch = await bcrypt.compare(password, adminData.password);

            if (passwordMatch) {
                req.session.admin_id = adminData._id
                req.session.adminLogged = true;
                console.log("home");
                res.redirect('/admin/home');
            } else {
                res.render('login', { errMsg: "invalid password" })
            }
        } else {
            res.render('login', { errMsg: "login failed" })
        }

    } catch (error) {
        next(error);
    }
}

// load home page
const loadHome = async (req, res,next) => {
    try {
        if (req.session.adminLogged == true) {
            const orderDatas = await Order.find({})
            const totalOrder = orderDatas.length
            const deliveredOrderData = await Order.find({status:"Delivered"}).populate('productDetails.productId')
            const activeProducts = await Products.find({status:true})
            const total = deliveredOrderData.map((item)=>item.totalPrice).reduce((acc,cur)=>acc+=cur)
            
            // console.log(total)
            // console.log(deliveredOrderData)
            const userData = await User.find({})
           
            const userCount = userData.length
            const productCount = activeProducts.length
            const orderCount = deliveredOrderData.length

            const orderData = await Order.find({status:"Delivered"}).populate('productDetails.productId')
       
            const totalProducts = orderData.reduce((acc,order)=>{
            const productDetails = order.productDetails.length
            return acc + productDetails;
        },0)
       
            const categories = await Category.find({status:true})
            const categoriesObj= {
                categoryNames : [],
                categoryPerc : []
            }
            categories.forEach((category)=>{
                const categoryCount = orderData.reduce((acc,order)=>{
                    const productDetails = order.productDetails;
                    const categoryCount = productDetails.filter(details=> details.productId.category.includes(category.categoryName)).length;
                    return acc + categoryCount;
                },0)
                const categoryPercentage = (categoryCount/totalProducts)*100;
                categoriesObj.categoryNames.push(category.categoryName)
                categoriesObj.categoryPerc.push(categoryPercentage)
            })
            console.log(categoriesObj)
            res.render('home',{orderCount,productCount,userCount,total,categoriesObj})
        } else {
            res.redirect('/admin')
        }

    } catch (error) {
        next(error);
    }
}

// product list page
const productList = async (req, res,next) => {
    try {
        const categoryData = await Category.find({}, { name: 1 })
        const productData = await Products.find({})
        res.render('product-list', { productData, categoryData })
    } catch (error) {
        next(error);
    }
}

//load product add form page
const addProduct = async (req, res,next) => {
    try {
        const categoryData = await Category.find({})
        res.render('add-product', { categoryData });
    } catch (error) {
        next(error);
    }
}

// verified product adding page part
const insertProducts = async (req, res,next) => {
    try {
        console.log(req.files);
        if (!req.body.productName.trim() || !req.body.price.trim() || !req.body.stock || !req.body.category || !req.files || !req.body.description.trim()) {
            res.render('add-product', { message: "Please check your form" });
        } else {
           
            
            const productData = new Products({
                productName: req.body.productName,
                price: req.body.price,
                stock: req.body.stock,
                category: req.body.category,
                image: imagesUpload,
                description: req.body.description
            });

            const products = await productData.save()
            if (products) {
                for (let i = 0; i < req.files.length; i++) {
                    const imagesUpload = req.files[i].filename
                    const originalPath = req.files[i].path
                    const extension = imagesUpload.split('.').pop()
                    const resizedFilename = `${imagesUpload}_resized.${extension}`
                    const resizedPath = `public/product-img/${resizedFilename}`
    
                    // Use sharp to resize and crop the image to 200x100 pixels
                    sharp(originalPath)
                        .resize(550, 650)
                        .toFile(resizedPath, (err, info) => {
                            if (err) {
                                console.log(err)
                            } else {
                                fs.unlink(originalPath, (err) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                })
                            }
                        })
                    // Use await to ensure the update is completed before redirecting
                    await Products.findOneAndUpdate({ _id: products._id }, { $push: { images: resizedFilename } })
                }
                res.redirect('/admin/productlist')
            }
        }
    } catch (error) {
        next(error);
    }
}

// // delete product page part
// const deleteProduct = async (req, res,next) => {
//     try {
//         await Products.deleteOne({ _id: req.query.id })
//         res.redirect('/admin/productlist')
//     } catch (error) {
//         next(error);
//     }
// }

// edit product page part
const editProduct = async (req, res,next) => {
    try {
        const id = req.query.id;
        req.session.query = id
        const productData = await Products.findById({ _id: id })
        console.log(productData)
        if (productData) {
            res.render('edit-product', { product: productData })
        } else {
            res.redirect('/admin/home')
        }
    } catch (error) {
        next(error);
    }
}

// update product page part
const updateProducts = async (req, res,next) => {
    try {
        const id = req.query.id
        // const productData = await Products.findById({ _id: id })
        if (!req.body.productName.trim() || !req.body.price.trim() || !req.body.stock || !req.body.category || !req.files || !req.body.description.trim()) {
            res.render('edit-product', { message: "Please check your form" });
        } else {

            for (let i = 0; i < req.files.length; i++) {
               
                const imagesUpload = req.files[i].filename
                    const originalPath = req.files[i].path
                    const extension = imagesUpload.split('.').pop()
                    const resizedFilename = `${imagesUpload}_resized.${extension}`
                    const resizedPath = `public/product-img/${resizedFilename}`
    
                    // Use sharp to resize and crop the image to 200x100 pixels
                    sharp(originalPath)
                        .resize(200, 300)
                        .toFile(resizedPath, (err, info) => {
                            if (err) {
                                console.log(err)
                            } else {
                                fs.unlink(originalPath, (err) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                })
                            }
                        })
                const poductData = await Products.updateOne({ _id: id }, { $push: { image: resizedFilename } })
            }
            const productData = await Products.findByIdAndUpdate({ _id: req.body.id }, {
                $set: {
                    productName: req.body.productName,
                    price: req.body.price,
                    stock: req.body.stock,
                    category: req.body.category,

                    description: req.body.description
                }
            });
            res.redirect('/admin/productlist');
        }
    } catch (error) {
        next(error);
    }
}

// enable product page part
const enableProduct = async (req, res,next) => {
    try {
        const id = req.query.id;
        await Products.findByIdAndUpdate({ _id: id }, { $set: { status: true } })
        res.redirect('/admin/productlist')
    } catch (error) {
        next(error)
    }
}

//edisable product page part
const disableProduct = async (req, res,next) => {
    try {
        const id = req.query.id;
        await Products.findByIdAndUpdate({ _id: id }, { $set: { status: false } })
        res.redirect('/admin/productlist')
    } catch (error) {
        next(error)
    }
}

//delete editpage image part
const deleteImage = async (req, res,next) => {
    try {
        const id = req.query.id
        const imagaeUpdate = await Products.updateOne({ image: id }, { $pull: { image: { $in: [id] } } })
        if (imagaeUpdate) {
            res.redirect('/admin/edit-product/?id=' + req.session.query);
        }
    } catch (error) {
        next(error);
    }
}

// logout page part
const logout = async (req, res,next) => {
    try {
        req.session.admin_id = "";
        req.session.adminLogged = false;
        res.redirect('/admin')
    } catch (error) {
        next(error);
    }
}


//user details load
const userDetails = async (req, res,next) => {
    try {
        const userData = await User.find()
        res.render('user-details', { users: userData })
    } catch (error) {
        next(error)
    }
}

// block page part
const blockUser = async (req, res,next) => {
    try {
        const id = req.query.id;
        await User.findByIdAndUpdate({ _id: id }, { $set: { status: false } })
        res.redirect('/admin/userDetails')
    } catch (error) {
        next(error)
    }
}

//unblock page part
const unblockUser = async (req, res,next) => {
    try {
        const id = req.query.id;
        await User.findByIdAndUpdate({ _id: id }, { $set: { status: true } })
        res.redirect('/admin/userDetails')
    } catch (error) {
        next(error)
    }
}

//load category part
const loadCategory = async (req, res,next) => {
    try {
        const categoryData = await Category.find({})
        res.render('category', { categoryData });
    } catch (error) {
        next(error);
    }
}

//load add category part
const loadaddCategory = async (req, res,next) => {
    try {
        res.render('addCategory');
    } catch (error) {
        next(error);
    }
}

//add category part
const insertCategory = async (req, res,next) => {
    try {
        if (req.body.categoryName.trim() === "") {
            res.render('addCategory', { message: "Feild is Empty" })
        } else {
            const categorys = new Category({
                categoryName: req.body.categoryName
            })
            const categoryName = await Category.findOne({ categoryName: { $regex: '.*' + categorys.categoryName + '.*', $options: 'i' } })
            if (categoryName) {
                res.render('addCategory', { message: "Name is Already Exists" })
            } else {
                const userData = await categorys.save();
                res.redirect('/admin/category')
            }
        }
    } catch (error) {
        next(error);
    }
}

// category  edit part
const editCategory = async (req, res,next) => {
    try {
        const id = req.query.id;

        const categoryData = await Category.findById({ _id: id })
        console.log(categoryData)
        if (categoryData) {
            res.render('edit-category', { category: categoryData })
        } else {
            res.redirect('/admin/home')
        }
    } catch (error) {
        next(error);
    }
}

// update category page part
const updateCategory = async (req, res,next) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.findById({ _id: id })
        if (req.body.categoryName.trim() === "") {
            res.render('edit-category', { message: "Feild is Empty", category: categoryData })
        } else {
            const categorys = new Category({
                categoryName: req.body.categoryName
            })
            const categoryName = await Category.findOne({ categoryName: { $regex: '.*' + categorys.categoryName + '.*', $options: 'i' } })
            if (categoryName) {
                res.render('edit-category', { message: "Name is Already Exists", category: categoryData })
            } else {
                await Category.findByIdAndUpdate({ _id: req.body.id }, {
                    $set: {
                        categoryName: req.body.categoryName
                    }
                });
                res.redirect('/admin/category')
            }
        }
    } catch (error) {
        next(error);
    }
}

//disable Category part
const disableCategory = async (req, res,next) => {
    try {
        await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: false } })
        
        res.redirect('/admin/category')
    } catch (error) {
        next(error)
    }
}

//enabale Category part
const enableCategory = async (req, res,next) => {
    try {
        await Category.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: true } })
        res.redirect('/admin/category')
    } catch (error) {
        next(error)
    }
}

// delete category page part
const deleteCategory = async (req, res,next) => {
    try {
        await Category.deleteOne({ _id: req.query.id })
        res.redirect('/admin/category')
    } catch (error) {
        next(error);
    }
}

// order list page part
const loadOrder = async (req, res,next) => {
    try {
        const orderData = await Order.find({}).sort({date:-1})
        console.log(orderData);

        res.render('orderList', { orderData })
    } catch (error) {
        next(error);
    }
}

//more about order details page
const orderDetails = async (req, res,next) => {
    try {
        const id = req.query.id
        const orderDetails = await Order.findOne({ _id: id }).populate('productDetails.productId')
        const productDetails = orderDetails.productDetails
        const user_Id = orderDetails.userId.toString()
        const address_Id = orderDetails.addressId.toString()
        const userDetails = await User.findOne({ _id: user_Id })
        const addressDetails = userDetails.address.find(item => item._id == address_Id)

        console.log(addressDetails);
        res.render('orderDetails', { productDetails, userDetails, orderDetails, addressDetails });
    } catch (error) {
        next(error);
    }
}

//orderStatus
const orderStatus = async (req, res,next) => {
    try {
        console.log(req.query.id)
        const orderdata = await Order.findOne({ _id: req.query.id })
        console.log(orderdata)
        
        if(req.body.status == "Delivered"){
            await Order.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: req.body.status,paymentStatus:"Payed" } })
        }else{
            await Order.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: req.body.status } })
        }
        res.redirect('/admin/orderList')
    } catch (error) {
        next(error);
    }
}

// Coupon List
const loadCoupon = async (req, res,next) => {
    try {
        const couponData = await Coupon.find({})
        console.log(couponData);

        res.render('couponList', { couponData })
    } catch (error) {
        next(error);
    }
}

//addCoupon
const addCoupon = async (req, res,next) => {
    try {
        const couponData = await Coupon.find({})
        console.log(couponData);

        res.render('addCoupon', { couponData })
    } catch (error) {
        next(error);
    }
}

//insert Coupon
const insertCoupon = async (req, res,next) => {
    try {
        console.log(req.body)
        if (!req.body.code.trim() || !req.body.maxDiscount.trim() || !req.body.expireDate.trim() || !req.body.value.trim() || !req.body.totalUsage.trim()) {
            res.render('addCoupon', { message: "Please check your form" });
        }else{
        const couponData = new Coupon({
            code: req.body.code,
            type: req.body.type,

            maxDiscount: req.body.maxDiscount,
            expireDate: req.body.expireDate,
            value: req.body.value,
            totalUsage: req.body.totalUsage,
            minOrder: req.body.minOrder
        })
        const coupons = await couponData.save()
        console.log(couponData)
        res.redirect('/admin/couponList')
        }

    } catch (error) {
        next(error);
    }
}

// editCoupon
const editCoupon = async (req, res,next) => {
    try {
        console.log(req.query.id)
        const couponData = await Coupon.findById({ _id: req.query.id })
        console.log(couponData);

        res.render('editCoupon', { couponData })
    } catch (error) {
        next(error);
    }
}

//update Coupon
const updateCoupon = async (req, res,next) => {
    try {
        console.log(req.body)
        const couponData = await Coupon.findByIdAndUpdate({ _id: req.body.id }, {
            $set: {
                code: req.body.code,
                type: req.body.type,
                maxDiscount: req.body.maxDiscount,
                expireDate: req.body.expireDate,
                value: req.body.value,
                totalUsage: req.body.totalUsage,
                minOrder: req.body.minOrder
            }});
            res.redirect('/admin/couponList')
    } catch (error) {
        next(error)
    }
}

//banner list 
const loadBanner = async (req, res,next) => {
    try {
        const bannerData = await Banner.find({})
        

        res.render('bannerList', { bannerData })

        
    } catch (error) {
        next(error);
    }
}

//add banner
const addBanner = async (req, res,next) => {
    try {
        

        res.render('addBanner')
    } catch (error) {
        next(error);
    }
}

//insert banner
const insertBanner = async (req, res,next) =>{
    try {
        
        const bannerData = new Banner({
            heading: req.body.heading,
            subtitle: req.body.subTitle,
            image: req.files[0].filename,
            status: req.body.status,
            btnText:req.body.btnTxt,
            btnLink: req.body.btnLink
        })
        const banners = await bannerData.save()
        
        res.redirect('/admin/bannerList')


    } catch (error) {
        next(error);
    }
}

// update banner 
const updateBanner = async (req, res,next) => {
    try {
        const bannerData = await Banner.findByIdAndUpdate({ _id: req.body.id }, {
            $set: {
                heading: req.body.heading,
            subtitle: req.body.subTitle,
            image: req.files[0].filename,
            status: req.body.status,
            btnText:req.body.btnTxt,
            btnLink: req.body.btnLink
            }
        });
        res.redirect('/admin/bannerList')
    } catch (error) {
        next(error);
    }
}

//delete banner
const deleteBanner = async (req, res,next) => {
    try {
        console.log(req.query.id);
        await Banner.deleteOne({ _id: req.query.id })
        res.redirect('/admin/bannerList')
    } catch (error) {
        next(error);
    }
}

//edit banner get page
const editBanner = async (req,res,next)=>{
    try {
        const bannerData = await Banner.findOne({ _id: req.query.id})
        res.render('editBanner',{bannerData})
    } catch (error) {
        next(error)
        
    }
}

//salesReport load 
 const loadSalesReport = async (req,res,next)=>{
    try {
        const salesData = await Order.find({status:"Delivered"}).populate('userId').populate('productDetails.productId')
        const productData = salesData.productDetails
        
        
        
        console.log(salesData)
        res.render('salesReport',{salesData})
    } catch (error) {
        next(error)
    }
 }

 //filter Report 
 const filterReport  = async (req,res,next)=>{
    try {
        console.log(req.body)
        let orderDetails;
        if(req.body.dateFrom && req.body.dateTo){
            orderDetails = await Order.find({$and:[{date:{$lte:new Date(req.body.dateTo)}},{date:{$gte:new Date(req.body.dateFrom)}},{status :"Delivered"}]}).populate('userId').populate('productDetails.productId')
        }else if(req.body.dateTo){
            orderDetails = await Order.find({status:"Delivered",date:{$lte:new Date(req.body.dateTo)}}).populate('userId').populate('productDetails.productId')
        }else{
            orderDetails = await Order.find({status:"Delivered",date:{$gte:new Date(req.body.dateFrom)}}).populate('userId').populate('productDetails.productId')
        }
        res.json({orderDetails: orderDetails})
        
    } catch (error) {
        next(error)
    }
 }

 //exportpdf
 const salesPdf = async(req,res,next)=>{
    try {

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report')

        worksheet.columns = [

            { header: "NAME", key: "name" },
            { header: "PRODUCT DETAILS", key: "productDetails" },
            { header: "QUANTITY", key: "quantity" },
            { header: "	DATE", key: "date" },
            { header: "PRICE", key: "totalPrice" },
            { header: "	PAYMENT MODE", key: "paymentMode" }
            

        ];

        const start = req.body.fromDate;
        const end = req.body.toDate;
        const orderData = await Order.find({ status: "Delivered", date: { $gte: start, $lte: end } }).sort({ date: 'desc' }).populate('userId').populate('productDetails.productId')
        console.log(orderData)

        
        for (let i = 0; i < orderData.length; i++) {
            const customerName = orderData[i].userId.name;
            const productId = orderData[i].productDetails.map(item=>item.productId);
            const quantityTotal = orderData[i].productDetails.map(item=>item.quantity);
            const productName=[]
            const quantity =[]
            for (let i= 0;i<productId.length;i++){
                productName [i] = productId[i].productName
            }
            for(let i=0;i<quantityTotal.length;i++){
                quantity[i] = quantityTotal[i]
            }

            const productDetails = orderData[i].productDetails.map(item=>item.name);
            
            worksheet.addRow({
                date:orderData[i].date.toLocaleDateString(),
                productDetails:productName,
                quantity:quantity,
                name:customerName,
                totalPrice: orderData[i].totalPrice,
                paymentMode: orderData[i].payment,
                
            });
        }

        res.setHeader(
            "content-Type",
            "application/vnd.openxmlformates-officedocument.spreadsheatml.sheet"
        )

        res.setHeader('Content-Disposition', 'attachment; filename=sales.xlsx')

        return workbook.xlsx.write(res).then(() => {
            res.status(200);
        })

    
  
        console.log("excel-generated")
    } catch (error) {
      next(error);
    }
  }

  // for graphDetails
  const graphDetails = async (req,res,next)=>{
    try {
        const currentDate = moment();

        // Subtract six months
        const sixMonthsAgo = moment().subtract(6, 'months');

        // Create an array to hold the six months
        const lastSixMonths = [];
        const orderSalesCount =[]
        const totalUserCount = []
        const paymentTotal =[]
        const revenueTotal =[]

        // orderFind isdelivered only
        const orderData = await Order.find({status:"Delivered"}).populate('productDetails.productId')
        const orderCount = orderData.length;

        const totalProducts = orderData.reduce((acc,order)=>{
            const productDetails = order.productDetails.length
            return acc + productDetails;
        },0)
        const categories = await Category.find({status:true})
        const categoryNames = [];
        const categoryPerc = [];
        categories.forEach((category)=>{
            const categoryCount = orderData.reduce((acc,order)=>{
                const productDetails = order.productDetails;
                const categoryCount = productDetails.filter(details=> details.productId.category.includes(category.categoryName)).length;
                return acc + categoryCount;
            },0)
            const categoryPercentage = (categoryCount/totalProducts)*100;
            categoryNames.push(category.categoryName)
            categoryPerc.push(categoryPercentage)
        })
        
        // Loop through the months and add them to the array
        const startDate = moment().subtract(6, 'months').startOf('month');
        const endDate = moment().endOf('month');
        
        
        for (let date = moment(sixMonthsAgo); date.diff(currentDate, 'months') <= 0; date.add(1, 'month')) {
          lastSixMonths.push(date.format('MMM'));
          console.log(date)
          const monthStart = moment(date).startOf('month')
          const monthEnd = moment(date).endOf('month')
            

          //order count
          const monthOrders = orderData.filter(order => moment(order.date).isBetween(monthStart, monthEnd));
          const OrderCount = monthOrders.length;
          orderSalesCount.push(OrderCount);

          //user count
          const monthUsers = monthOrders.map(order => order.userId);
          const userCount = monthUsers.length;
          totalUserCount.push(userCount);

          // payment price count
          const monthPayments = monthOrders.map(order => order.totalPrice).reduce((acc,cur)=> acc+=cur,0);
          paymentTotal.push(monthPayments)
        
          //revenue
          const monthRevenue = monthOrders.map(order => order.totalPrice).reduce((acc,cur)=> acc+=cur,0);
          revenueTotal.push(monthRevenue);

          startDate.add(1, 'month');
          endDate.subtract(1, 'month');
        }

        //for order statitics
        const categoryList = [];
        
        // Print the array of six months
        console.log(orderSalesCount)
        console.log(totalUserCount)
        console.log(paymentTotal)
        res.json({orderSalesCount,lastSixMonths,revenueTotal,totalUserCount,paymentTotal,categoryNames,categoryPerc,})



    } catch (error) {
        next(error)
    }
  }

module.exports = {
    loginLoad,
    verifiedLogin,
    loadHome,
    productList,
    addProduct,
    insertProducts,
    // deleteProduct,
    editProduct,
    updateProducts,
    disableProduct,
    enableProduct,
    logout,
    loadCategory,
    userDetails,
    blockUser,
    unblockUser,
    loadaddCategory,
    insertCategory,
    editCategory,
    updateCategory,
    enableCategory,
    disableCategory,
    deleteCategory,
    deleteImage,
    loadOrder,
    orderDetails,
    orderStatus,
    loadCoupon,
    addCoupon,
    insertCoupon,
    editCoupon,
    updateCoupon,
    loadBanner,
    addBanner,
    insertBanner,
    updateBanner,
    deleteBanner,
    editBanner,
    loadSalesReport,
    filterReport,
    salesPdf,
    graphDetails,
}

// try {
    //     console.log(req.body)
    //   const start = req.body.fromDate
    //  const end = req.body.toDate
    //   const orderSuccess = await Order.find({ status:"Delivered",date: {$gte:start, $lte:end}} ).sort({date:'desc'})
      
    //   const data ={
    //     orderSuccess:orderSuccess
    //   }