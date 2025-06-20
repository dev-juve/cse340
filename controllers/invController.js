const invModel = require("../models/inventory-model")
const utilities = require("../utilities")
const reviewModel = require("../models/review-model")
const { body, validationResult } = require("express-validator")
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
  const inv_id = parseInt(req.params.inv_id)
  const errors = validationResult(req)

  if (isNaN(inv_id)) {
    req.flash("notice", "Invalid vehicle ID.")
    return res.redirect("/inv")
  }

  const vehicle = await invModel.getInventoryById(inv_id)
  const nav = await utilities.getNav()

  if (!vehicle) {
    return res.status(404).send("Vehicle not found")
  }

  const html = await utilities.buildVehicleDetail(vehicle)

  // Inventory Review Logics
  const reviews = await reviewModel.getReviewsByInvId(inv_id)
  res.render("./inventory/vehicleDetails", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    html,
    vehicle,
    reviews,
    loggedin: res.locals.loggedin || false,
    accountData: res.locals.accountData || {},
    errors
  })

}


async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  const notice = req.flash("notice")
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    // errors: null,
    message: req.flash("message"),
    notice
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
async function getInventoryJSON(req, res, next) {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
async function editInventoryView(req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id); // assumes this function exists
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    console.log(req.flash("notice"))
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }
}

/* ============================
 * Build Delete Confirmation View
 * ============================ */
async function buildDeleteView(req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const data = await invModel.getInventoryById(inv_id)
  if (!data || !data.rows || data.rows.length === 0) {
  req.flash("notice", "Inventory item not found.")
  return res.redirect("/inv")
}
  const nav = await utilities.getNav()
  const item = data.rows[0]
  const name = `${item.inv_make} ${item.inv_model}`

  res.render("./inventory/delete-confirm", {
    title: `Delete ${name}`,
    nav,
    errors: null,
    inv_id: item.inv_id,
    inv_make: item.inv_make,
    inv_model: item.inv_model,
    inv_year: item.inv_year,
    inv_price: item.inv_price
  })
}

/* ============================
 * Process Inventory Deletion
 * ============================ */
async function deleteInventoryItem(req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const result = await invModel.deleteInventoryItem(inv_id)

  if (result.rowCount) {
    req.flash("notice", "The item was successfully deleted.")
    res.redirect("/inv")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}


module.exports = {
  buildByClassificationId,
  buildByInvId,
  triggerError,
  buildManagement,
  addClassification,
  buildAddClassification,
  addInventory,
  buildAddInventory,
  getInventoryJSON,
  editInventoryView,
  updateInventory,
  buildDeleteView,
  deleteInventoryItem,
}
