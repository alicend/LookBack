import { render, screen } from "@testing-library/react";
import { MainPageLayout } from "@/components/layout/MainPageLayout";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import "@testing-library/jest-dom";
import { useRouter } from "next/router";

// useRouterのモック
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

const dummyChildText = "Test content";

describe("<MainPageLayout />", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      asPath: "/somepath", // デフォルトのパス
    });
  });

  test("renders the MainPageLayout", () => {
    render(
      <Provider store={store}>
        <MainPageLayout title="Test Title">
          <p>{dummyChildText}</p>
        </MainPageLayout>
      </Provider>,
    );

    expect(screen.getByText("Look Back")).toBeInTheDocument();
  });

  test("renders the child content", () => {
    render(
      <Provider store={store}>
        <MainPageLayout title="Test Title">
          <p>{dummyChildText}</p>
        </MainPageLayout>
      </Provider>,
    );

    expect(screen.getByText(dummyChildText)).toBeInTheDocument();
  });
});
