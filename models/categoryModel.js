const mongoose =require("mongoose")
const categorySchema = mongoose.Schema({
    categoryName:{
        type:String,
        require:true
    },
    status:{
        type:Boolean,
        default:true
    }
});

module.exports = mongoose.model('Category',categorySchema);