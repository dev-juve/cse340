const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 * Deliver login view
 **************************************** */
async function buildLogin(req, res) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: [],
    account_email: ""
  })
}

/* ****************************************
 * Deliver registration view
 **************************************** */
async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
 * Process Registration
 **************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: [],
        account_email: ""
      })
    } else {
      throw new Error()
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

/* ****************************************
 * Process login request
 **************************************** */
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
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

  delete accountData.account_password
  const token = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

  res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 })
  res.redirect("/account")
}

/* ****************************************
 * Account management view
 **************************************** */
async function buildAccount(req, res) {
  const nav = await utilities.getNav()
  res.render("account/account", {
    title: "Account Management",
    nav,
    message: req.flash("notice"),
    errors: null
  })
}

/* ****************************************
 * Build Account Update View
 **************************************** */
async function buildAccountUpdateView(req, res) {
  const nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)

  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account")
  }

  res.render("account/update-account", {
    title: "Edit Account",
    nav,
    errors: null,
    message: req.flash("notice"),
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id
  })
}

/* ****************************************
 * Update Account Information
 **************************************** */
async function updateAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const result = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (result) {
    req.flash("notice", "Account updated successfully.")
    res.redirect("/account")
  } else {
    req.flash("notice", "Update failed.")
    res.render("account/update-account", {
      title: "Edit Account",
      nav,
      errors: null,
      message: req.flash("notice"),
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
  }
}

/* ****************************************
 * Update Account Password
 **************************************** */
async function updatePassword(req, res) {
  const nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)
  const result = await accountModel.updatePassword(account_id, hashedPassword)

  if (result) {
    req.flash("notice", "Password updated successfully.")
    res.redirect("/account")
  } else {
    const accountData = await accountModel.getAccountById(account_id)
    req.flash("notice", "Password update failed.")
    res.render("account/update-account", {
      title: "Edit Account",
      nav,
      message: req.flash("notice"),
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id
    })
  }
}

/* ****************************************
 * Logout
 **************************************** */
function logout(req, res) {
  res.clearCookie("jwt")
  req.flash("success", "You have been logged out.")
  res.redirect("/")
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccount,
  buildAccountUpdateView,
  updateAccount,
  updatePassword,
  logout
}
