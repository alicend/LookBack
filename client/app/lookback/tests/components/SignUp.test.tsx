import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { store } from "../../store/store";
import SignUp from "@/components/SignUp";
import axios from "axios";

// axiosのモック化
jest.mock("axios");

describe("<SignUp />", () => {
  test("renders SignUp component", () => {
    render(
      <Provider store={store}>
        <SignUp email="test@example.com" userGroupID="" />
      </Provider>,
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
  });

  test("fills out the form and submits", () => {
    // モック化したaxiosの返り値を設定
    (axios.post as jest.Mock).mockResolvedValue({});

    render(
      <Provider store={store}>
        <SignUp email="test@example.com" userGroupID="TestGroupID" />
      </Provider>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "Test User" },
    });
    // ボタンがクリック可能かどうか確認
    expect(screen.getByTestId("signup-button")).not.toBeDisabled();

    fireEvent.click(screen.getByTestId("signup-button"));
  });
});
