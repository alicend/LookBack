import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { store } from "@/store/store";
import CalenderModal from "@/components/calendar/CalenderModal";

describe("<CalenderModal />", () => {
  const mockModalStyle: React.CSSProperties = {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };

  test("renders the modal with CalendarTaskDisplay component", () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme()}>
          <CalenderModal
            open={true}
            onClose={jest.fn()}
            modalStyle={mockModalStyle}
          />
        </ThemeProvider>
      </Provider>,
    );

    // レンダリングしていることを確認
    expect(screen.getByText("Task details")).toBeInTheDocument();
  });

  test("does not render the modal when open is false", () => {
    const result = render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme()}>
          <CalenderModal
            open={false}
            onClose={jest.fn()}
            modalStyle={mockModalStyle}
          />
        </ThemeProvider>
      </Provider>,
    );

    expect(result.container.innerHTML).toBe("");
  });
});
