require('dotenv').config();

const mongoose =  require("mongoose");
mongoose.set('strictQuery',false);
mongoose.connect(process.env.MONGODB_CONNECTION);

module.exports = {
    mongoose
}