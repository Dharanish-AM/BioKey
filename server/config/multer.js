const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        cb(null, 'temp/');
    },
    filename: (req, file, cb) => {

        cb(null, path.extname(file.originalname || file.filename));
    },
});


const upload = multer({ storage }).array('file', 30);


module.exports = upload;
