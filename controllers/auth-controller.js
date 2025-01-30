import { generateToken } from "../utils/jwt.js";
import config from "../config/index.js";

export const login = (req, res) => {
  const { apiKey } = req.body;

  const user = config.users.find((u) => u.apiKey === apiKey);

  if (user) {
    const token = generateToken(user);
    res.json({ token });
  } else {
    res.status(401).json({ message: "API key inválida" });
  }
};

export const renewToken = (req, res) => {
  const newToken = generateToken(req.user);
  res.json({ token: newToken });
};
