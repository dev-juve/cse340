const utilities = require("../utilities")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")
const { buildAddClassification } = require("../controllers/invController")

/* **********************************
 * Registration Data Validation Rules
 * ********************************* */
function registrationRules() {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.")
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* **********************************
 * Validation Rules for Account Update
 * ********************************* */
function accountUpdateRules() {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required."),

    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required."),

    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required.")
      .custom(async (email, { req }) => {
        const existingAccount = await accountModel.getAccountByEmail(email)
        if (existingAccount && existingAccount.account_id != req.body.account_id) {
          throw new Error("Email already in use. Please choose another.")
        }
      })
  ]
}

/* **********************************
 * Check Account Update Validation
 * ********************************* */
async function checkAccountUpdate (req, res, next) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/update-account", {
      title: "Edit Account",
      nav,
      errors: errors.array(),
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
  }
  next()
}

/* **********************************
 * Password Update Validation Rules
 * ********************************* */
function passwordUpdateRules() {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
      .withMessage("Password must be at least 12 characters long and include uppercase, lowercase, number, and symbol.")
  ]
}

/* **********************************
 * Check Password Update Validation
 * ********************************* */
async function checkPasswordUpdate(req, res, next) {
  const { account_id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const account = await accountModel.getAccountById(account_id)
    return res.render("account/update-account", {
      title: "Edit Account",
      nav,
      errors: errors.array(),
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
      account_id
    })
  }
  next()
}

/* **********************************
 * Check Registration Data
 * ********************************* */
async function checkRegData (req, res, next) {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* **********************************
 * Login Validation Rules
 * ********************************* */
const loginRules = [
  body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required."),
  body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
]

/* **********************************
 * Check Login Data
 * ********************************* */
async function checkLoginData (req, res, next) {
  const { account_email } = req.body
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      return res.render("account/login", {
        title: "Login",
        nav,
        errors: errors.array(),
        account_email,
      })
    }
    next()
  } catch (error) {
    console.error("Login validation error:", error)
    next(error)
  }
}

/* **********************************
 * Inventory Validation 
 * ********************************* */
const inventoryRules = () => {
  return [
    body("classification_id").notEmpty().isNumeric().withMessage("Select a classification."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price").notEmpty().isFloat({ min: 0 }).withMessage("Valid price required."),
    body("inv_year").notEmpty().isInt({ min: 1900 }).withMessage("Valid year required."),
    body("inv_miles").notEmpty().isInt({ min: 0 }).withMessage("Valid miles required."),
    body("inv_color").trim().notEmpty().withMessage("Color is required.")
  ]
}

const checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(classification_id);
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      errors: errors.array(),
      nav,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    });
    return;
  }
  next();
}

/* **********************************
 * Export all validation middleware
 * ********************************* */
module.exports = {
  registrationRules,
  loginRules,
  checkRegData,
  checkLoginData,
  inventoryRules,
  checkInventoryData,
  accountUpdateRules,
  checkAccountUpdate,
  passwordUpdateRules,
  checkPasswordUpdate
}
