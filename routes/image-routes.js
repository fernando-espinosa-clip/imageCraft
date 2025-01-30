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
  router.delete(
    "/:key",
    authenticateJWT(["delete"]),
    imageController.deleteImage,
  );
  router.get("/", authenticateJWT(["list"]), imageController.listImages);

  return router;
};
