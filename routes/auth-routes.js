import express from "express";
import { login, renewToken } from "../controllers/auth-controller.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/renew-token", authenticateJWT([]), renewToken);

export default router;
