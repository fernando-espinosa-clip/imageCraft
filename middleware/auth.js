import { verifyToken, generateToken } from "../utils/jwt.js";

export const authenticateJWT = (requiredPermissions) => (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    try {
      const user = verifyToken(token);

      // Verificar permisos
      const hasRequiredPermissions = requiredPermissions.every((permission) =>
        user.permissions.includes(permission),
      );

      if (!hasRequiredPermissions) {
        return res.status(403).json({ message: "Permisos insuficientes" });
      }

      // Verificar si el token está próximo a expirar (menos de 5 minutos)
      const expirationTime = user.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      if (timeUntilExpiration < 300000) {
        // 5 minutos en milisegundos
        // Generar un nuevo token
        const newToken = generateToken(user, user.loginMode);
        res.setHeader("X-New-Token", newToken);
      }

      req.user = user;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expirado" });
      }
      return res.sendStatus(403);
    }
  } else {
    res.sendStatus(401);
  }
};

export default authenticateJWT;
