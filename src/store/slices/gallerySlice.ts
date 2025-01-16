import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GalleryState {
  images: string[];
}

const initialState: GalleryState = {
  images: [],
};

const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    setImages: (state, action: PayloadAction<string[]>) => {
      state.images = action.payload;
    },
  },
});

export const { setImages } = gallerySlice.actions;
export default gallerySlice.reducer;
