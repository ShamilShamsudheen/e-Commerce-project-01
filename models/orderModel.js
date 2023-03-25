const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

const orderDetailsId = new mongoose.Schema({
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
    }
})

const orderSchema = new mongoose.Schema({
    productDetails:[orderDetailsId],
    userId:{
        type:ObjectId,
        ref:"User"
    },
    addressId:{
        type:ObjectId,
        required:true
    },
    totalPrice:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    payment:{
        type:String,
        required:true
    },
    paymentStatus:{
        type:String,
        required:true
    },
    
    date:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('Order',orderSchema)