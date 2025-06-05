const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

/* ***************************
 *  Build inventory by classification view
 * ************************** */
async function buildByClassificationId(req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()

  // Safely get the classification name
  const className = data.length > 0 ? data[0].classification_name : "Unknown"

  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
async function buildByInvId(req, res, next) {
  const inv_id = req.params.inv_id
  const vehicle = await invModel.getInventoryById(inv_id)
  let nav = await utilities.getNav()
  if (!vehicle) {
    return res.status(404).send("Vehicle not found")
  }

  const html = await utilities.buildVehicleDetail(vehicle)

  res.render("./inventory/vehicledetails", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    html,
  })
}

/* ***************************
 *  Test 500 error trigger
 * ************************** */
function triggerError(req, res, next) {
  const err = new Error("Oops! This is a test 500 error.")
  next(err)
}

module.exports = {
  buildByClassificationId,
  buildByInvId,
  triggerError
}
