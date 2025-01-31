import { UserService } from "../services/user-service.js";
import { generateToken } from "../utils/jwt.js";

const userService = new UserService();

export const login = async (req, res) => {
  const { apiKey } = req.body;
  try {
    const token = await userService.authenticateUserByApiKey(apiKey);
    console.log("token", token);
    if (token) {
      res.json({ token });
    } else {
      res.status(401).json({ message: "API key inválida" });
    }
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const renewToken = (req, res) => {
  const newToken = generateToken(req.user);
  res.json({ token: newToken });
};
