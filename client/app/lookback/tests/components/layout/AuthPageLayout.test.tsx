import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "@/store/store";
import { AuthPageLayout } from "@/components/layout/AuthPageLayout";

describe("<AuthPageLayout />", () => {
  const dummyChildText = "Dummy child content";

  beforeEach(() => {
    render(
      <Provider store={store}>
        <AuthPageLayout title="Test Title">
          <p>{dummyChildText}</p>
        </AuthPageLayout>
      </Provider>,
    );
  });

  test("renders the AuthPageHeader", () => {
    expect(screen.getByText("Look Back")).toBeInTheDocument();
  });

  test("renders the child content", () => {
    expect(screen.getByText(dummyChildText)).toBeInTheDocument();
  });
});
