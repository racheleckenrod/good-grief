const express = require("express");
const router = express.Router();
const consentController = require("../controllers/consent");

router.get("/", consentController.getConsent);
router.get("/setCookie", consentController.setCookie);
router.get("/privacyPolicy", consentController.getPrivacyPolicy);
router.get("/removeCookies", consentController.removeCookies);

module.exports = router;