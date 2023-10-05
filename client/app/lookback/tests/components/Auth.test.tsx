import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { store } from "../../store/store";
import Auth from "@/components/Auth";
import axios from "axios";

// axiosのモック化
jest.mock("axios");

describe("<Auth />", () => {
  test("renders the Auth component", () => {
    render(
      <Provider store={store}>
        <Auth />
      </Provider>,
    );

    const allLoginElements = screen.getAllByText("Login");
    expect(allLoginElements).toHaveLength(2);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  test("handles button clicks correctly", async () => {
    render(
      <Provider store={store}>
        <Auth />
      </Provider>,
    );

    fireEvent.click(screen.getByTestId("auth-button"));

    fireEvent.click(screen.getByText("アカウントを作成"));
    fireEvent.click(screen.getByText("Send Sign-up Email"));

    fireEvent.click(screen.getByText("ログインに戻る"));

    fireEvent.click(screen.getByText("こちら"));
    fireEvent.click(screen.getByText("Send Password-Reset Email"));

    fireEvent.click(screen.getByText("ログインに戻る"));

    fireEvent.click(screen.getByText("Login as a Guest"));
  });

  test("renders the Auth component and triggers login", () => {
    // モック化したaxiosの返り値を設定
    (axios.post as jest.Mock).mockResolvedValue({});

    render(
      <Provider store={store}>
        <Auth />
      </Provider>,
    );

    const allLoginElements = screen.getAllByText("Login");
    expect(allLoginElements).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("auth-button"));
  });
});
