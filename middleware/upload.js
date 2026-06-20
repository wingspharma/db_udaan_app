const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createUpload = (folderName) => {
    const uploadPath = path.join(__dirname, `../uploads/${folderName}`);

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination(req, file, cb) {
            cb(null, uploadPath);
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, Date.now() + ext);
        }
    });

    return multer({ storage });
};

module.exports = createUpload;