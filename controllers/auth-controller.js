import { randomUUID } from "crypto";
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
    const token = await userService.authenticateUser(
      username,
      password,
      "credentials",
    );
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
    const token = await userService.authenticateUserByApiKey(apiKey, "apikey");
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
  const newToken = generateToken(
    {
      id: req.user.userId,
      permissions: req.user.permissions,
      apiKey: req.user.apiKey,
    },
    req.user.loginMode,
  );
  res.json({ token: newToken });
};

export const register = async (req, res, next) => {
  const { first_name, last_name, email, username, password } = req.body;

  if (!first_name || !last_name || !email || !username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newUser = await userService.createUser({
      first_name,
      last_name,
      email,
      username,
      password,
      apikey: randomUUID(),
      file_permissions: ["upload", "list"],
    });
    const token = generateToken(
      {
        id: newUser.id,
        permissions: newUser.file_permissions,
        apiKey: newUser.apikey,
      },
      "credentials",
    );
    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ user: safeUser, token });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
};
