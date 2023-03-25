const sessionSecret = "mysitesessionsecret";

const multer =require("multer")
const path =require("path")

const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,path.join(__dirname,'../public/product-img'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const error = new Error('File type not supported!');
      error.statusCode = 400;
      cb(error);
    }
  };



  const location = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,path.join(__dirname,'../public/bannerImage'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
});

const imageFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const error = new Error('File type not supported!');
      error.statusCode = 400;
      cb(error);
    }
  };

  const upload = multer({ storage: storage, fileFilter: fileFilter });
  const bannerUpload = multer({ storage: location, fileFilter: imageFilter });

module.exports = {
     sessionSecret,
     upload,
     bannerUpload
}