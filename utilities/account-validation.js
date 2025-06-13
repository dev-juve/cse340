const utilities = require("../utilities")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")
const { buildAddClassification } = require("../controllers/invController")

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
  }),

  
      // password is required and must be strong password
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

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
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
 * Check Login Validation Result
 * ********************************* */
const checkLoginData = async (req, res, next) => {
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
    let classificationList = await utilities.buildClassificationList(classification_id); // ← This must be here
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



module.exports = {
  registrationRules: validate.registrationRules,
  loginRules,
  checkRegData: validate.checkRegData,
  checkLoginData,
  inventoryRules,
  checkInventoryData
}


