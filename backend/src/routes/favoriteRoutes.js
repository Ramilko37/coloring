import express from "express";
import {
  addFavorite,
  deleteFavorite,
  getFavoriteById,
  getFavorites,
  updateFavorite,
} from "../controllers/favoriteController.js";
import { isAuthenticatedUser } from "../middleware/auth.js";

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(isAuthenticatedUser);

// Маршруты для работы с избранными раскрасками
router.route("/").get(getFavorites).post(addFavorite);
router
  .route("/:id")
  .get(getFavoriteById)
  .put(updateFavorite)
  .delete(deleteFavorite);

export default router;
