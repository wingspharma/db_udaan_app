const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload");
const distributerController = require("../../controllers/v1/distributer");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/get-docs",authMiddleware, distributerController.getDocuments);
router.get("/get-target",authMiddleware, distributerController.getTarget);
router.post("/upload-banner", upload("banner").single("image"), distributerController.uploadBanner);
router.get("/get-banner",distributerController.getBanner);
router.post("/add-notification",authMiddleware, distributerController.addNotification);
router.get("/get-notifications",authMiddleware, distributerController.getNotifications);

module.exports = router;