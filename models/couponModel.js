const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');


const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true  
    },
    type:{
        type:String,
        required:true
        
    },
    
    maxDiscount:{
        type:Number,
        required:true
    },
    expireDate:{
        type:String,
        required:true  
    },
    value:{
        type:Number,
        required:true
    },
    totalUsage:{
        type:Number,
      
    },
    usersId:{
        type:ObjectId,
        ref:"User",
        
    },
    order:{
        type:ObjectId,
        ref:'Order'
    },
    minOrder:{
        type:Number,
        required:true
    },
    usedUser:{
        type:Array
    }
});

module.exports = mongoose.model("Coupon",couponSchema)