const mongoose =require("mongoose")
const productSchema = mongoose.Schema({
    productName:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    stock:{
        type:Number,
        require:true
    },
    category:{
        type:String,
        require:true
    },
    image:{
        type:Array
        
    },
    description:{
        type:String,
        require:true
    },
    status:{
        type:Boolean,
        default:true
    },
    is_enable:{
        type:Boolean,
        default:true
    }
    
});

module.exports = mongoose.model('Products',productSchema);