import { render, screen, act } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "@/store/store";
import { MessageBar } from "@/components/layout/MessageBar";
import { editTaskStatus, editTaskMessage } from "@/slices/taskSlice";
import { editUserStatus, editUserMessage } from "@/slices/userSlice";
import {
  editUserGroupStatus,
  editUserGroupMessage,
} from "@/slices/userGroupSlice";

describe("<MessageBar />", () => {
  test("displays snackbar for taskStatus succeeded", () => {
    render(
      <Provider store={store}>
        <MessageBar />
      </Provider>,
    );
    act(() => {
      store.dispatch(editTaskStatus("succeeded"));
      store.dispatch(editTaskMessage("Task completed"));
    });

    expect(screen.getByTestId("message-bar")).toBeVisible();
    expect(screen.getByText("Task completed")).toBeVisible();
  });

  test("displays snackbar for taskStatus failed", () => {
    render(
      <Provider store={store}>
        <MessageBar />
      </Provider>,
    );
    act(() => {
      store.dispatch(editTaskStatus("failed"));
      store.dispatch(editTaskMessage("Failed to fetch Task"));
    });

    expect(screen.getByTestId("message-bar")).toBeVisible();
    expect(screen.getByText("Failed to fetch Task")).toBeVisible();
  });

  test("hides snackbar for taskStatus loading", () => {
    render(
      <Provider store={store}>
        <MessageBar />
      </Provider>,
    );
    act(() => {
      store.dispatch(editTaskStatus("loading"));
      store.dispatch(editTaskMessage("loading fetch Task"));
    });

    expect(screen.queryByText("loading fetch Task")).not.toBeInTheDocument();
  });

  test("displays snackbar for userStatus succeeded", () => {
    render(
      <Provider store={store}>
        <MessageBar />
      </Provider>,
    );
    act(() => {
      store.dispatch(editUserStatus("succeeded"));
      store.dispatch(editUserMessage("User completed"));
    });

    expect(screen.getByTestId("message-bar")).toBeVisible();
    expect(screen.getByText("User completed")).toBeVisible();
  });

  test("displays snackbar for userStatus failed", () => {
    render(
      <Provider store={store}>
        <MessageBar />
      </Provider>,
    );
    act(() => {
      store.dispatch(editUserStatus("failed"));
      store.dispatch(editUserMessage("Failed to fetch User"));
    });

    expect(screen.getByTestId("message-bar")).toBeVisible();
    expect(screen.getByText("Failed to fetch User")).toBeVisible();
  });

  test("hides snackbar for userStatus loading", () => {
    render(
      <Provider store={store}>
        <MessageBar />
      </Provider>,
    );
    act(() => {
      store.dispatch(editUserStatus("loading"));
      store.dispatch(editUserMessage("loading fetch User"));
    });

    expect(screen.queryByText("loading fetch User")).not.toBeInTheDocument();
  });

  test("displays snackbar for userGroupStatus succeeded", () => {
    render(
      <Provider store={store}>
        <MessageBar />
      </Provider>,
    );
    act(() => {
      store.dispatch(editUserGroupStatus("succeeded"));
      store.dispatch(editUserGroupMessage("UserGroup completed"));
    });

    expect(screen.getByTestId("message-bar")).toBeVisible();
    expect(screen.getByText("UserGroup completed")).toBeVisible();
  });

  test("displays snackbar for userGroupStatus failed", () => {
    render(
      <Provider store={store}>
        <MessageBar />
      </Provider>,
    );
    act(() => {
      store.dispatch(editUserGroupStatus("failed"));
      store.dispatch(editUserGroupMessage("Failed to fetch UserGroup"));
    });

    expect(screen.getByTestId("message-bar")).toBeVisible();
    expect(screen.getByText("Failed to fetch UserGroup")).toBeVisible();
  });

  test("hides snackbar for userGroupStatus loading", () => {
    render(
      <Provider store={store}>
        <MessageBar />
      </Provider>,
    );
    act(() => {
      store.dispatch(editUserGroupStatus("loading"));
      store.dispatch(editUserGroupMessage("loading fetch UserGroup"));
    });

    expect(
      screen.queryByText("loading fetch UserGroup"),
    ).not.toBeInTheDocument();
  });
});
