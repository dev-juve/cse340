// Needed Resources 
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities")

/* ***********************************
 * Public: Inventory by classification view
 * *********************************** */
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

/* ***********************************
 * Public: Inventory item detail view
 * *********************************** */
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInvId)
)

/* ***********************************
 * Trigger error for testing
 * *********************************** */
router.get("/trigger-error", (req, res) => {
  throw new Error("Intentional Server Error for Testing")
})

/* ***********************************
 * Management route (Admin/Employee only)
 * *********************************** */
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagement)
)

/* ***********************************
 * Add Classification form (Admin/Employee only)
 * *********************************** */
router.get(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)

/* ***********************************
 * Add Classification - Process form
 * *********************************** */
router.post(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkEmployeeOrAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

/* ***********************************
 * Add Inventory form (Admin/Employee only)
 * *********************************** */
router.get(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

/* ***********************************
 * Add Inventory - Process form
 * *********************************** */
router.post(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

/* ***********************************
 * AJAX JSON endpoint (used publicly for dynamic dropdowns)
 * *********************************** */
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

/* ***********************************
 * Edit Inventory view (Admin/Employee only)
 * *********************************** */
router.get(
  "/edit/:inv_id",
  utilities.checkJWTToken,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
)

/* ***********************************
 * Update Inventory - Process form
 * *********************************** */
router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.checkEmployeeOrAdmin,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

/* ***********************************
 * Confirm Delete view (Admin/Employee only)
 * *********************************** */
router.get(
  "/delete/:inv_id",
  utilities.checkJWTToken,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteView)
)

/* ***********************************
 * Perform Delete (Admin/Employee only)
 * *********************************** */
router.post(
  "/delete",
  utilities.checkJWTToken,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryItem)
)

module.exports = router
