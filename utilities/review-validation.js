// utilities/review-validation.js
const { body, validationResult } = require("express-validator")
const utilities = require("../utilities")
const reviewModel = require("../models/review-model")
const accountModel = require("../models/account-model")
const invModel = require("../models/inventory-model")

const validate = {}

validate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .notEmpty()
      .withMessage("Review cannot be empty."),
    body("inv_id")
      .notEmpty()
      .isInt()
      .withMessage("Invalid vehicle ID."),
  ]
}

validate.checkReviewData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await require("../utilities").getNav()
    const review_text = req.body.review_text || ""
    const inv_id = req.body.inv_id
    const account_id = parseInt(req.body.account_id)
    const invModel = require("../models/inventory-model")
    const reviewModel = require("../models/review-model")
    const vehicle = await invModel.getInventoryById(inv_id)
    const html = await require("../utilities").buildVehicleDetail(vehicle)
    const reviews = await reviewModel.getReviewsByInvId(inv_id)
    const accountData = await accountModel.getAccountById(account_id)

    return res.status(400).render("inventory/vehicleDetails", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      html,
      reviews,
      vehicle,
      loggedin: true,
      accountData,
      errors: errors.array(),
      review_text
    })
  }
  next()
}

module.exports = validate
