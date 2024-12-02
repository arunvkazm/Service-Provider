const express = require("express");
const router = express.Router();
const addPromotionalAd = require("../controller/promotionalAdsController");
const upload = require("../middleware/multer");
const { authenticateJWT, authorizeRole } = require("../middleware/auth");

router.post(
  "/",
  //  authenticateJWT,
  // authorizeRole(["admin"]),
  upload.single("image"),
  addPromotionalAd.addPromotionalAd
);

router.get("/", addPromotionalAd.getPromotionalAds);
router.put("/:id",upload.single("image"), addPromotionalAd.updatePromotionalAds);
router.delete("/:id", addPromotionalAd.deletePromotionalAds);

module.exports = router;
