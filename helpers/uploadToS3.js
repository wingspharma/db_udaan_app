const path = require("path");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");

module.exports = async (file, folder) => {

   const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}${ext}`;
    const key = `${folder}/${fileName}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        })
    );

    return {
        key,
        fileName,
        url: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${key}`
    };
};