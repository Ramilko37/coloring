import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EditorState {
  painting: string;
}

const initialState: EditorState = {
  painting: "",
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setPainting: (state, action: PayloadAction<string>) => {
      state.painting = action.payload;
    },
  },
});

export const { setPainting } = editorSlice.actions;
export default editorSlice.reducer;
