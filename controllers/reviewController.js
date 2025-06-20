const reviewModel = require("../models/review-model")
const utilities = require("../utilities")

async function addReview(req, res) {
  const { review_text, inv_id, account_id } = req.body
  try {
    await reviewModel.addReview(review_text, inv_id, account_id)
    req.flash("notice", "Review submitted successfully.")
    res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    req.flash("notice", "Error submitting review.")
    res.redirect(`/inv/detail/${inv_id}`)
  }
}
module.exports = { addReview }
