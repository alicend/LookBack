import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { store } from "../../store/store";
import PasswordReset from "@/components/PasswordReset";

describe("<PasswordReset />", () => {
    test("renders the PasswordReset component", () => {
        render(
          <Provider store={store}>
            <PasswordReset email="test@example.com" />
          </Provider>,
        );
      
        const allPasswordResetElements = screen.getAllByText("Password Reset");
        expect(allPasswordResetElements).toHaveLength(2);
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
      });
})

