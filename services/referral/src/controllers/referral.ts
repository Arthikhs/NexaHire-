import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

// POST /api/referral/offer  - recruiter offers to refer
export const createReferralOffer = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { company_name, role, description, max_referrals } = req.body;
  if (!company_name || !role) throw new ErrorHandler(400, "company_name and role are required");

  const [offer] = await sql`
    INSERT INTO referral_offers (provider_id, provider_name, company_name, role, description, max_referrals)
    VALUES (${user.user_id}, ${user.name}, ${company_name}, ${role}, ${description ?? null}, ${max_referrals ?? 3})
    RETURNING *
  `;
  res.status(201).json({ message: "Referral offer created", offer });
});

// GET /api/referral/offers?company=Google&role=SDE
export const getReferralOffers = TryCatch(async (req, res) => {
  const { company, role } = req.query as Record<string, string>;
  let query = `SELECT * FROM referral_offers WHERE is_active = true`;
  const values: any[] = [];
  let i = 1;
  if (company) { query += ` AND company_name ILIKE $${i++}`; values.push(`%${company}%`); }
  if (role) { query += ` AND role ILIKE $${i++}`; values.push(`%${role}%`); }
  query += " ORDER BY created_at DESC LIMIT 50";
  const offers = (await sql.query(query, values)) as any[];
  res.json(offers);
});

// POST /api/referral/request/:offerId  - jobseeker requests referral
export const requestReferral = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  if (user.role !== "jobseeker") throw new ErrorHandler(403, "Only jobseekers can request referrals");
  const { offerId } = req.params;
  const { message } = req.body;

  const [offer] = await sql`SELECT * FROM referral_offers WHERE offer_id = ${offerId} AND is_active = true`;
  if (!offer) throw new ErrorHandler(404, "Referral offer not found");
  if (offer.provider_id === user.user_id) throw new ErrorHandler(400, "Cannot request own referral");

  const [existing] = await sql`SELECT request_id FROM referral_requests WHERE offer_id = ${offerId} AND requester_id = ${user.user_id}`;
  if (existing) throw new ErrorHandler(409, "Already requested this referral");

  const [request] = await sql`
    INSERT INTO referral_requests (offer_id, requester_id, requester_name, message, provider_id)
    VALUES (${offerId}, ${user.user_id}, ${user.name}, ${message ?? null}, ${offer.provider_id})
    RETURNING *
  `;
  res.status(201).json({ message: "Referral requested", request });
});

// GET /api/referral/my-requests  - jobseeker sees their requests
export const getMyRequests = TryCatch(async (req: AuthenticatedRequest, res) => {
  const requests = await sql`
    SELECT rr.*, ro.company_name, ro.role, ro.provider_name
    FROM referral_requests rr
    JOIN referral_offers ro ON rr.offer_id = ro.offer_id
    WHERE rr.requester_id = ${req.user!.user_id}
    ORDER BY rr.created_at DESC
  `;
  res.json(requests);
});

// GET /api/referral/incoming  - provider sees incoming requests
export const getIncomingRequests = TryCatch(async (req: AuthenticatedRequest, res) => {
  const requests = await sql`
    SELECT rr.*, ro.company_name, ro.role
    FROM referral_requests rr
    JOIN referral_offers ro ON rr.offer_id = ro.offer_id
    WHERE rr.provider_id = ${req.user!.user_id}
    ORDER BY rr.created_at DESC
  `;
  res.json(requests);
});

// PUT /api/referral/request/:requestId  - provider updates status
export const updateReferralStatus = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { requestId } = req.params;
  const { status } = req.body; // "Accepted" | "Rejected" | "Referred"
  if (!["Accepted", "Rejected", "Referred"].includes(status))
    throw new ErrorHandler(400, "Invalid status");

  const [rq] = await sql`SELECT provider_id FROM referral_requests WHERE request_id = ${requestId}`;
  if (!rq) throw new ErrorHandler(404, "Request not found");
  if (rq.provider_id !== req.user!.user_id) throw new ErrorHandler(403, "Forbidden");

  const [updated] = await sql`UPDATE referral_requests SET status = ${status} WHERE request_id = ${requestId} RETURNING *`;

  // update trust score if referred
  if (status === "Referred") {
    await sql`UPDATE referral_offers SET referrals_given = referrals_given + 1 WHERE offer_id = ${updated.offer_id}`;
    await sql`
      INSERT INTO trust_scores (user_id, score) VALUES (${req.user!.user_id}, 10)
      ON CONFLICT (user_id) DO UPDATE SET score = trust_scores.score + 10
    `;
  }

  res.json({ message: "Status updated", request: updated });
});

// GET /api/referral/trust/:userId
export const getTrustScore = TryCatch(async (req, res) => {
  const { userId } = req.params;
  const [score] = await sql`SELECT score FROM trust_scores WHERE user_id = ${userId}`;
  res.json({ trust_score: score?.score ?? 0 });
});
