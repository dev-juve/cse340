const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: [],
    account_email: "" // for sticky
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "No account found for that email." }],
      account_email
    })
  }

  const match = await bcrypt.compare(account_password, accountData.account_password)

  if (!match) {
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: [{ msg: "Incorrect password. Please try again." }],
      account_email
    })
  }

  // If login is successful, generate JWT and redirect
  delete accountData.account_password
  const token = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

  res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 })
  res.redirect("/account") // or wherever you want to go
}
/* ****************************************
 *  Build account View
 * ************************************ */
async function buildAccount(req, res) {
  let nav = await utilities.getNav()
  res.render("account/account", {
    title: "Account Management",
    nav,
    errors: null,
    message: req.flash("notice"),
  })
}

module.exports = { 
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccount
}
