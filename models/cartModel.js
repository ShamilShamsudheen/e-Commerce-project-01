const { ObjectId } = require("mongodb");
const mongoose =require("mongoose")
const productSchema = mongoose.Schema({
    productId:{
        type:ObjectId,
        required:true,
        ref:'Products'
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:false
    },
 
    
    
});

const cartSchema = mongoose.Schema({
    userData:{
        type:ObjectId,
        required:true
    },
    products:[productSchema],
    coupon:{
        type:ObjectId,
        ref:"Coupon"
    } 
})


module.exports = mongoose.model('Cart',cartSchema);