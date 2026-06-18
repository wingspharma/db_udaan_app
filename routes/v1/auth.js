const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload");

const authController = require("../../controllers/v1/auth");

const authMiddleware = require("../../middleware/authMiddleware");

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.get("/profile", authMiddleware, authController.profile);
router.post("/resend-otp", authController.resendOtp);
router.post("/logout", authMiddleware, authController.logout);
router.post("/update-profile", authMiddleware, upload.single("image"), authController.updateProfileImage);


module.exports = router;
