import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please enter a name for your coloring"],
      trim: true,
    },
    image: {
      type: String, // Будем хранить изображение в base64 формате
      required: [true, "Image is required"],
    },
    description: {
      type: String,
      default: "",
    },
    tags: [String], // Опционально: теги для поиска и фильтрации
  },
  { timestamps: true }, // Автоматически добавляет поля createdAt и updatedAt
);

export default mongoose.model("Favorite", favoriteSchema);
