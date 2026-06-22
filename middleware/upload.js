const multer = require("multer");

const createUpload = () => {
    const storage = multer.memoryStorage();

    return multer({
        storage,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10 MB
        }
    });
};

module.exports = createUpload;