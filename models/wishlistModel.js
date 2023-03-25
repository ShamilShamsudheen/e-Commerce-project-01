const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const productSchema =mongoose.Schema({
    productId:{
        type:ObjectId,
        ref:"Products"
    },
});

const wishlistSchema = mongoose.Schema({
    userData:{
        type:ObjectId,
        require:true
    },
    products:[productSchema]
});

module.exports = mongoose.model('Wishlist',wishlistSchema);