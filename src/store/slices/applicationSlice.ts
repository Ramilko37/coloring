import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppModeEnum } from "../../types";

interface ApplicationState {
  appMode: AppModeEnum;
}

const initialState: ApplicationState = {
  appMode: AppModeEnum.Home,
};

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setAppMode: (state, action: PayloadAction<AppModeEnum>) => {
      state.appMode = action.payload;
    },
  },
});

export const { setAppMode } = applicationSlice.actions;
export default applicationSlice.reducer;
