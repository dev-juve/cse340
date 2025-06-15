const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process registration
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process login
router.post(
  "/login",
  regValidate.loginRules, 
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))

module.exports = router
