import taskReducer from "@/slices/taskSlice";
import userReducer from "@/slices/userSlice";
import userGroupReducer from "@/slices/userGroupSlice";

import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    task: taskReducer,
    user: userReducer,
    userGroup: userGroupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export type AppDispatch = typeof store.dispatch;
