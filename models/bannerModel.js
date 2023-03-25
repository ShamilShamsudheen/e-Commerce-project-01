const mongoose =require("mongoose")
const bannerSchema = mongoose.Schema({
    
    image:{
        type:String,
        required:true
    },
    heading:{
        type:String,
        required:true
    },
    subtitle:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    btnText:{
        type:String,
        required:true
    },
    btnLink:{
        type:String,
        required:true
    },
    
});

module.exports = mongoose.model('Banner',bannerSchema);