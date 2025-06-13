const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

/* ***************************
 *  Build inventory by classification view
 * ************************** */
async function buildByClassificationId(req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()

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
  const nav = await utilities.getNav()

  if (!vehicle) {
    return res.status(404).send("Vehicle not found")
  }

  const html = await utilities.buildVehicleDetail(vehicle)

  res.render("./inventory/vehicleDetails", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    html,
  })
}

/* ***************************
 *  Build inventory management view
 * ************************** */
async function buildManagement(req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("message"),
  })
}

/* ***************************
 *  Build classification form view
 * ************************** */
async function buildAddClassification(req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: req.flash("message"),
    errors: null,
    classification_name: ""
  })
}

/* ***************************
 *  Process add classification form
 * ************************** */
async function addClassification(req, res) {
  const nav = await utilities.getNav()
  const { classification_name } = req.body

  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("message", "Classification added successfully.")
    res.redirect("/inv")
  } else {
    req.flash("message", "Failed to add classification.")
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: req.flash("message"),
      errors: null,
      classification_name
    })
  }
}

/* ***************************
 *  Build add-inventory form view
 * ************************** */
async function buildAddInventory(req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    message: req.flash("message"),
    errors: null,
  })
}

/* ***************************
 *  Process add-inventory form
 * ************************** */
async function addInventory(req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)

  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body

  const addResult = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  )

  if (addResult) {
    req.flash("message", "New vehicle added successfully.")
    res.redirect("/inv")
  } else {
    req.flash("message", "Failed to add vehicle.")
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      message: req.flash("message"),
      errors: null,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    })
  }
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
  triggerError,
  buildManagement,
  addClassification,
  buildAddClassification,
  addInventory,
  buildAddInventory
}
