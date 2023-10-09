import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "@/store/store";
import Password from "@/components/profile/Password";

const currentPassword = "Password123";
const newPassword = "NewPassword456";
const invalidPassword1 = "invalid";
const invalidPassword2 = "invalidPassword";
const samePassword = "Password123";

describe("<Password />", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <Password loginStatus={false} />
      </Provider>,
    );
  });

  test("renders password input fields correctly", () => {
    const currentPasswordInput = screen.getByLabelText("Current Password");
    expect(currentPasswordInput).toHaveValue("");

    const newPasswordInput = screen.getByLabelText("New Password");
    expect(newPasswordInput).toHaveValue("");
  });

  test("dispatches action with new and current passwords when update button is clicked", () => {
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: currentPassword },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: newPassword },
    });
    fireEvent.click(screen.getByText("UPDATE"));
  });

  test("shows error message for invalid passwords less than 8 characters format", () => {
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: currentPassword },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: invalidPassword1 },
    });
    fireEvent.click(screen.getByText("UPDATE"));

    expect(
      screen.getByText("パスワードは８文字以上にしてください"),
    ).toBeInTheDocument();
  });

  test("shows error message for invalid only characters password format", () => {
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: currentPassword },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: invalidPassword2 },
    });
    fireEvent.click(screen.getByText("UPDATE"));

    expect(
      screen.getByText(
        "パスワードには少なくとも１つ以上の半角英字と半角数字を含めてください",
      ),
    ).toBeInTheDocument();
  });

  test("shows error message when the new password is the same as the current password", () => {
    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: samePassword },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: samePassword },
    });
    fireEvent.click(screen.getByText("UPDATE"));

    expect(
      screen.getByText(
        "新しいパスワードは現在のパスワードと異なるものにしてください",
      ),
    ).toBeInTheDocument();
  });
});
