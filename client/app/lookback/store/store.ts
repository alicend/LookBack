import taskReducer  from '@/reducer/taskSlice';
import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    task: taskReducer,
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