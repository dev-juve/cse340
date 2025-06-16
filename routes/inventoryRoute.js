// Needed Resources 
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities")

/* ***********************************
 * Route to build inventory by classification view
 * *********************************** */
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

/* ***********************************
 * Route to build inventory item details
 * *********************************** */
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInvId)
)

/* ***********************************
 * Route to trigger a manual error (testing)
 * *********************************** */
router.get("/trigger-error", (req, res) => {
  throw new Error("Intentional Server Error for Testing")
})

/* ***********************************
 * Management route
 * *********************************** */
router.get(
  "/",
  utilities.handleErrors(invController.buildManagement)
)

/* ***********************************
 * Add Classification form route
 * *********************************** */
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

/* ***********************************
 * Process Add Classification form
 * *********************************** */
router.post(
  "/add-classification",
  invValidate.classificationRules(),            
  invValidate.checkClassificationData,           
  utilities.handleErrors(invController.addClassification) 
)

/* ***********************************
 * Add Inventory form route
 * *********************************** */
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
)

/* ***********************************
 * Process Add Inventory form
 * *********************************** */
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),                 
  invValidate.checkInventoryData,                
  utilities.handleErrors(invController.addInventory)
)

// Route to build the edit inventory view
router.get("/edit/:inv_id", invController.editInventoryView);

// Route to handle inventory update
router.post(
  "/update",
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  invController.updateInventory
)

// GET: Confirm Delete View
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteView))

// POST: Perform Delete
router.post("/delete", utilities.handleErrors(invController.deleteInventoryItem))

module.exports = router
