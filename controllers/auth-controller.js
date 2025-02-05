import { UserService } from "../services/user-service.js";
import { generateToken } from "../utils/jwt.js";
import { UniqueConstraintError } from "../utils/databaseErrors.js";

const userService = new UserService();

export const loginWithCredentials = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const token = await userService.authenticateUser(username, password);
    if (token) {
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    next(error);
  }
};

export const loginWithApiKey = async (req, res, next) => {
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

export const register = async (req, res, next) => {
  const { first_name, last_name, email, username, password } = req.body;

  if (!first_name || !last_name || !email || !username || !password) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  try {
    const newUser = await userService.createUser({
      first_name,
      last_name,
      email,
      username,
      password,
      file_permissions: ["upload", "list"], // Permisos por defecto
    });
    const token = generateToken(newUser);
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
};
