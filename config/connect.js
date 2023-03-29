require('dotenv').config();

const mongoose =  require("mongoose");
mongoose.set('strictQuery',false);
mongoose.connect(process.env.MONGO);

module.exports = {
    mongoose
}