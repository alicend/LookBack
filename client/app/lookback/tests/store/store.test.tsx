import { store, RootState } from "../../store/store";
import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "@/slices/taskSlice";
import userReducer from "@/slices/userSlice";
import userGroupReducer from "@/slices/userGroupSlice";

describe("Redux Store", () => {
  // 初期状態のテスト
  it("should have an initial state", () => {
    const initialState: RootState = store.getState();
    expect(initialState.task).toBeDefined();
    expect(initialState.user).toBeDefined();
    expect(initialState.userGroup).toBeDefined();
  });

  // 各レデューサーのテスト
  it("should use the correct reducers", () => {
    const testStore = configureStore({
      reducer: {
        task: taskReducer,
        user: userReducer,
        userGroup: userGroupReducer,
      },
    });

    const initialState: RootState = testStore.getState();
    expect(initialState.task).toEqual(taskReducer(undefined, { type: "" }));
    expect(initialState.user).toEqual(userReducer(undefined, { type: "" }));
    expect(initialState.userGroup).toEqual(
      userGroupReducer(undefined, { type: "" }),
    );
  });
});
