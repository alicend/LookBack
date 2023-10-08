import { render, fireEvent, screen } from "@testing-library/react";
import { MainPageHeader } from "@/components/layout/MainPageHeader";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "@/store/store";
import { useRouter } from "next/router";

// useRouterのモック
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("<MainPageHeader />", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      asPath: "/somepath",
    });
  });

  test("renders the provided title", () => {
    render(
      <Provider store={store}>
        <MainPageHeader title="Test Title" />
      </Provider>,
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  test("opens IconMenu when the button is clicked", () => {
    render(
      <Provider store={store}>
        <MainPageHeader title="Test Title" />
      </Provider>,
    );

    fireEvent.click(screen.getByTestId("menu-button"));
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });
});
