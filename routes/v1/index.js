const express = require("express");
const router = express.Router();
const authRoute = require("./auth");
const distributerRoute = require('../../routes/v1/distributer');

router.use('/auth', authRoute);
router.use('/distributer', distributerRoute )
module.exports = router;

