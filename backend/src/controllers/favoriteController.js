import Favorite from "../models/favoriteModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// Добавить раскраску в избранное
export const addFavorite = async (req, res, next) => {
  try {
    console.log("Добавление в избранное:", req.body);

    const { name, image, description, tags } = req.body;

    // Проверяем обязательные поля
    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: "Пожалуйста, заполните все обязательные поля",
      });
    }

    // Создаем новую запись избранного
    const favorite = await Favorite.create({
      user: req.user.id, // ID пользователя из middleware аутентификации
      name,
      image,
      description: description || "",
      tags: tags || [],
    });

    console.log("Раскраска добавлена в избранное:", favorite._id);

    res.status(201).json({
      success: true,
      favorite,
    });
  } catch (error) {
    console.error("Ошибка при добавлении в избранное:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Внутренняя ошибка сервера",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Получить все избранные раскраски пользователя
export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    next(error);
  }
};

// Получить одну избранную раскраску по ID
export const getFavoriteById = async (req, res, next) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return next(new ErrorHandler("Раскраска не найдена", 404));
    }

    // Проверяем, принадлежит ли раскраска текущему пользователю
    if (favorite.user.toString() !== req.user.id) {
      return next(new ErrorHandler("Доступ запрещен", 403));
    }

    res.status(200).json({
      success: true,
      favorite,
    });
  } catch (error) {
    next(error);
  }
};

// Обновить избранную раскраску
export const updateFavorite = async (req, res, next) => {
  try {
    let favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return next(new ErrorHandler("Раскраска не найдена", 404));
    }

    // Проверяем, принадлежит ли раскраска текущему пользователю
    if (favorite.user.toString() !== req.user.id) {
      return next(new ErrorHandler("Доступ запрещен", 403));
    }

    favorite = await Favorite.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      favorite,
    });
  } catch (error) {
    next(error);
  }
};

// Удалить избранную раскраску
export const deleteFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return next(new ErrorHandler("Раскраска не найдена", 404));
    }

    // Проверяем, принадлежит ли раскраска текущему пользователю
    if (favorite.user.toString() !== req.user.id) {
      return next(new ErrorHandler("Доступ запрещен", 403));
    }

    await favorite.deleteOne();

    res.status(200).json({
      success: true,
      message: "Раскраска удалена из избранного",
    });
  } catch (error) {
    next(error);
  }
};
