import { UserService } from "../services/user-service.js";
import { generateToken } from "../utils/jwt.js";

const userService = new UserService();

export const login = async (req, res, next) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: "API key is required" });
  }

  try {
    const token = await userService.authenticateUserByApiKey(apiKey);
    if (token) {
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid API key" });
    }
  } catch (error) {
    next(error);
  }
};

export const renewToken = (req, res) => {
  const newToken = generateToken(req.user);
  res.json({ token: newToken });
};
