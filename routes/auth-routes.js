import express from "express";
import {
  loginWithCredentials,
  loginWithApiKey,
  renewToken,
  register,
} from "../controllers/auth-controller.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginWithCredentials);
router.post("/login/apikey", loginWithApiKey);
router.post("/register", register);
router.post("/renew-token", authenticateJWT([]), renewToken);

export default router;
