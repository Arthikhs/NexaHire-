import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const postReview = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { companyId } = req.params;
  const { rating, title, pros, cons } = req.body;

  if (!rating || !title || !pros || !cons)
    throw new ErrorHandler(400, "All fields are required");

  if (rating < 1 || rating > 5)
    throw new ErrorHandler(400, "Rating must be between 1 and 5");

  const [company] = await sql`SELECT company_id FROM companies WHERE company_id = ${companyId}`;
  if (!company) throw new ErrorHandler(404, "Company not found");

  const [review] = await sql`
    INSERT INTO company_reviews (company_id, user_id, user_name, rating, title, pros, cons)
    VALUES (${companyId}, ${user.user_id}, ${user.name}, ${rating}, ${title}, ${pros}, ${cons})
    ON CONFLICT (company_id, user_id) DO UPDATE
      SET rating = ${rating}, title = ${title}, pros = ${pros}, cons = ${cons}, created_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  res.status(201).json({ message: "Review posted successfully", review });
});

export const getCompanyReviews = TryCatch(async (req, res) => {
  const { companyId } = req.params;

  const reviews = await sql`
    SELECT * FROM company_reviews WHERE company_id = ${companyId} ORDER BY created_at DESC
  `;

  const [stats] = await sql`
    SELECT
      COUNT(*)::int AS total,
      ROUND(AVG(rating)::numeric, 1) AS avg_rating
    FROM company_reviews WHERE company_id = ${companyId}
  `;

  res.json({ reviews, stats });
});

export const deleteReview = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { reviewId } = req.params;

  const [review] = await sql`SELECT user_id FROM company_reviews WHERE review_id = ${reviewId}`;
  if (!review) throw new ErrorHandler(404, "Review not found");
  if (review.user_id !== user.user_id) throw new ErrorHandler(403, "Forbidden");

  await sql`DELETE FROM company_reviews WHERE review_id = ${reviewId}`;
  res.json({ message: "Review deleted" });
});
