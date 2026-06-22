const multer = require("multer");

const createUpload = () => {
    const storage = multer.memoryStorage();

    return multer({
        storage,
        limits: {
            fileSize: 30 * 1024 * 1024 // 30 MB
        }
    });
};

module.exports = createUpload;