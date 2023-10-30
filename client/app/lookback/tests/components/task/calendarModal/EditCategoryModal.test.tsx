import React from "react";
import { act, render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { RenderResult } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { store } from "@/store/store";
import EditCategoryModal from "@/components/task/categoryModal/EditCategoryModal";

const testCategory = {
  ID: 1,
  Category: "Test Category",
};

describe("<EditCategoryModal />", () => {
  beforeEach(() => {
    act(() => {
      render(
        <Provider store={store}>
          <ThemeProvider theme={createTheme()}>
            <EditCategoryModal
              open={true}
              onClose={() => {}}
              originalCategory={testCategory}
            />
          </ThemeProvider>
        </Provider>,
      );
    });
  });

  // ここからテストを始めます。
  test("renders EditCategoryModal component correctly", () => {
    expect(screen.getByLabelText("Edit category")).toHaveValue(
      testCategory.Category,
    );
  });

  test("updates the category value correctly", () => {
    act(() => {
      const input = screen.getByLabelText("Edit category");
      fireEvent.change(input, { target: { value: "Updated Category" } });
    });

    expect(screen.getByLabelText("Edit category")).toHaveValue(
      "Updated Category",
    );
  });

  test("opens the delete confirmation dialog", () => {
    act(() => {
      const deleteButton = screen.getByText("DELETE");
      fireEvent.click(deleteButton);
    });

    expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
    expect(
      screen.getByText(
        `カテゴリ「${testCategory.Category}」に関連するタスクも削除されますが本当に削除してよろしいですか？`,
      ),
    ).toBeInTheDocument();
  });
});
