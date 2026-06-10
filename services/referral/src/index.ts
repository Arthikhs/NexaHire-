import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { sql } from "./utils/db.js";

async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS referral_offers (
        offer_id        SERIAL PRIMARY KEY,
        provider_id     INTEGER NOT NULL,
        provider_name   VARCHAR(150) NOT NULL,
        company_name    VARCHAR(200) NOT NULL,
        role            VARCHAR(150) NOT NULL,
        description     TEXT,
        max_referrals   SMALLINT DEFAULT 3,
        referrals_given SMALLINT DEFAULT 0,
        is_active       BOOLEAN DEFAULT true,
        created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_referral_offers_company ON referral_offers(company_name)`;

    await sql`
      CREATE TABLE IF NOT EXISTS referral_requests (
        request_id    SERIAL PRIMARY KEY,
        offer_id      INTEGER NOT NULL REFERENCES referral_offers(offer_id) ON DELETE CASCADE,
        requester_id  INTEGER NOT NULL,
        requester_name VARCHAR(150) NOT NULL,
        provider_id   INTEGER NOT NULL,
        message       TEXT,
        status        VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending','Accepted','Rejected','Referred')),
        created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(offer_id, requester_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_referral_requests_provider ON referral_requests(provider_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_referral_requests_requester ON referral_requests(requester_id)`;

    await sql`
      CREATE TABLE IF NOT EXISTS trust_scores (
        user_id INTEGER PRIMARY KEY,
        score   INTEGER DEFAULT 0
      )
    `;
    console.log("✅ Referral DB tables ready");
  } catch (error) {
    console.error("❌ Referral DB init failed", error);
    process.exit(1);
  }
}

initDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Referral service running on http://localhost:${process.env.PORT}`);
  });
});
