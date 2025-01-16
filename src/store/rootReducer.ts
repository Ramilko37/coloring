import { combineReducers } from "@reduxjs/toolkit";
import applicationReducer from "./slices/applicationSlice";
import editorReducer from "./slices/editorSlice";
import galleryReducer from "./slices/gallerySlice";

export const rootReducer = combineReducers({
  application: applicationReducer,
  editor: editorReducer,
  gallery: galleryReducer,
});
