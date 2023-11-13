const express = require("express");
const router = express.Router();
const consentController = require("../controllers/consent");

router.get("/", consentController.getConsent);
router.get("/setCookie", consentController.setCookie);

module.exports = router;