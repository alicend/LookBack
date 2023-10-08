import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AuthPageHeader } from "@/components/layout/AuthPageHeader";

describe("<AuthPageHeader />", () => {
  beforeEach(() => {
    render(<AuthPageHeader title="Test Title" />);
  });

  test("displays the correct title", () => {
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });
});
