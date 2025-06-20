const pool = require("../database/")

async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = "INSERT INTO review (review_text, inv_id, account_id) VALUES ($1, $2, $3)"
    return await pool.query(sql, [review_text, inv_id, account_id])
  } catch (error) {
    throw new Error("addReview error: " + error)
  }
}

async function getReviewsByInvId(inv_id) {
  try {
    const sql = `
      SELECT r.review_text, r.review_date, a.account_firstname
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      WHERE inv_id = $1
      ORDER BY r.review_date DESC
    `
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    throw new Error("getReviewsByInvId error: " + error)
  }
}

module.exports = { addReview, getReviewsByInvId }
