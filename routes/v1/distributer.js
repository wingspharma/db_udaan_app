const express = require("express");
const router = express.Router();

const distributerController = require("../../controllers/v1/distributer");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/get-docs",authMiddleware, distributerController.getDocuments);
router.get("/get-target",authMiddleware, distributerController.getTarget);

module.exports = router;