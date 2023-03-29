const User = require('../models/userModel')

const isBlocked = async (req,res,next) => {
    try {
        const user = await User.findOne({_id:req.session.user_id})
        
        if(user.status == false){
            console.log('sdfghjkjhgfdsdfghjhgfd')
            req.session.userLogged = false
            res.render('pageNotFound')
        }else{
            console.log('sdfg')
            next()
        }
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    isBlocked,
}