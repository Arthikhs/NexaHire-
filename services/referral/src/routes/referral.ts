import express from "express";
import { isAuth } from "../middlewares/auth.js";
import {
  createReferralOffer, getReferralOffers, requestReferral,
  getMyRequests, getIncomingRequests, updateReferralStatus, getTrustScore,
} from "../controllers/referral.js";

const router = express.Router();

router.get("/offers", getReferralOffers);
router.post("/offer", isAuth, createReferralOffer);
router.post("/request/:offerId", isAuth, requestReferral);
router.get("/my-requests", isAuth, getMyRequests);
router.get("/incoming", isAuth, getIncomingRequests);
router.put("/request/:requestId", isAuth, updateReferralStatus);
router.get("/trust/:userId", getTrustScore);

export default router;
