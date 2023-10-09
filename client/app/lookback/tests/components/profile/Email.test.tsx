import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "@/store/store";
import Email from "@/components/profile/Email";
import { fetchAsyncUpdateLoginUserEmail } from "@/slices/userSlice";

const loginUserEmail = "loginUserEmail@example.com";

describe("<Email />", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <Email loginUserEmail={loginUserEmail} loginStatus={false} />
      </Provider>
    );
  });

  test("renders email input fields correctly", () => {
    const currentEmailInput = screen.getByLabelText("Current Email");
    expect(currentEmailInput).toHaveValue(loginUserEmail);

    const newEmailInput = screen.getByLabelText("New Email");
    expect(newEmailInput).toHaveValue("");
  });

  test("dispatches action with new email when update button is clicked", () => {
    const newEmail = "new@example.com";

    fireEvent.change(screen.getByLabelText("New Email"), {
      target: { value: newEmail },
    });
    fireEvent.click(screen.getByText("SEND UPDATE MAIL"));
  });

  test("shows error message for invalid email format", () => {
    const invalidEmail = "invalid-email";
    fireEvent.change(screen.getByLabelText("New Email"), {
      target: { value: invalidEmail },
    });
    fireEvent.click(screen.getByText("SEND UPDATE MAIL"));

    expect(screen.getByText("無効なメールアドレスです")).toBeInTheDocument();
  });

  test("shows error message when the same email as current email is entered", () => {
    fireEvent.change(screen.getByLabelText("New Email"), {
      target: { value: loginUserEmail },
    });
    fireEvent.click(screen.getByText("SEND UPDATE MAIL"));

    expect(
      screen.getByText(
        "新しいメールアドレスは現在のメールアドレスと異なるものにしてください"
      )
    ).toBeInTheDocument();
  });
});
