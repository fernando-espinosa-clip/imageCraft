import express from "express";
import { authenticateJWT } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const createImageRouter = (imageController) => {
  const router = express.Router();

  router.post(
    "/upload",
    authenticateJWT(["upload"]),
    upload.array("files", 10),
    imageController.upload,
  );
  router.get("/:key", imageController.getImage);
  router.delete("/:key", authenticateJWT(["delete"]), (req, res, next) => {
    if (req.user.loginMode === "apikey") {
      return imageController.deleteUserImage(req, res, next);
    }
    return imageController.deleteImage(req, res, next);
  });
  router.get("/", authenticateJWT(["list"]), (req, res, next) => {
    if (req.user.loginMode === "apikey") {
      return imageController.listUserImages(req, res, next);
    }
    return imageController.listImages(req, res, next);
  });

  return router;
};
