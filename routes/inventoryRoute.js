// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to build inventory item details
router.get("/detail/:inv_id", invController.buildByInvId);
// Route to build error
router.get("/trigger-error", (req, res) => {
  throw new Error("Intentional Server Error for Testing")
})


module.exports = router;