import React, { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomToolbar } from "@/components/calendar/CustomToolbar";
import "@testing-library/jest-dom";

jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  Hidden: ({ children }: { children: ReactNode }) => children,
}));

describe("<CustomToolbar />", () => {
  const mockOnNavigate = jest.fn();
  beforeEach(() => {
    mockOnNavigate.mockReset();
  });

  test("renders label correctly", () => {
    render(<CustomToolbar label="January 2023" onNavigate={mockOnNavigate} />);
    const labels = screen.getAllByText("January 2023");
    expect(labels).toHaveLength(2);
  });

  test("triggers onNavigate when Back button is clicked", () => {
    render(<CustomToolbar label="January 2023" onNavigate={mockOnNavigate} />);
    const backButtons = screen.getAllByText("Back");
    expect(backButtons).toHaveLength(2);

    fireEvent.click(backButtons[0]);
    expect(mockOnNavigate).toHaveBeenCalledWith("PREV");

    mockOnNavigate.mockClear();

    fireEvent.click(backButtons[1]);
    expect(mockOnNavigate).toHaveBeenCalledWith("PREV");

    const labels = screen.getAllByText("January 2023");
    expect(labels).toHaveLength(2);
  });

  test("triggers onNavigate when Today button is clicked", () => {
    render(<CustomToolbar label="January 2023" onNavigate={mockOnNavigate} />);
    const todayButtons = screen.getAllByText("Today");
    expect(todayButtons).toHaveLength(2);

    fireEvent.click(todayButtons[0]);
    expect(mockOnNavigate).toHaveBeenCalledWith("TODAY");

    mockOnNavigate.mockClear();

    fireEvent.click(todayButtons[1]);
    expect(mockOnNavigate).toHaveBeenCalledWith("TODAY");

    const labels = screen.getAllByText("January 2023");
    expect(labels).toHaveLength(2);
  });

  test("triggers onNavigate when Next button is clicked", () => {
    render(<CustomToolbar label="January 2023" onNavigate={mockOnNavigate} />);
    const nextButtons = screen.getAllByText("Next");
    expect(nextButtons).toHaveLength(2);

    fireEvent.click(nextButtons[0]);
    expect(mockOnNavigate).toHaveBeenCalledWith("NEXT");

    mockOnNavigate.mockClear();

    fireEvent.click(nextButtons[1]);
    expect(mockOnNavigate).toHaveBeenCalledWith("NEXT");

    const labels = screen.getAllByText("January 2023");
    expect(labels).toHaveLength(2);
  });
});
