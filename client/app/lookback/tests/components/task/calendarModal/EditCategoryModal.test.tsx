import React from "react";
import { render, fireEvent } from "@testing-library/react";
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
    let getByLabelText: RenderResult["getByLabelText"];
    let getByText: RenderResult["getByText"];

  beforeEach(() => {
    const renderResult = render(
        <Provider store={store}>
          <ThemeProvider theme={createTheme()}>
            <EditCategoryModal
              open={true}
              onClose={() => {}}
              originalCategory={testCategory}
            />
          </ThemeProvider>
        </Provider>
      );

      getByLabelText = renderResult.getByLabelText;
      getByText = renderResult.getByText;
  });

  test("renders EditCategoryModal component correctly", () => {
    expect(getByLabelText("Edit category")).toHaveValue(testCategory.Category);
  });

  test("updates the category value correctly", () => {
    const input = getByLabelText("Edit category");
    fireEvent.change(input, { target: { value: "Updated Category" } });
    expect(input).toHaveValue("Updated Category");
  });

  test("opens the delete confirmation dialog", () => {
    const deleteButton = getByText("DELETE");
    fireEvent.click(deleteButton);

    expect(getByText("Confirm Delete")).toBeInTheDocument();
    expect(
      getByText(
        `カテゴリ「${testCategory.Category}」に関連するタスクも削除されますが本当に削除してよろしいですか？`,
      ),
    ).toBeInTheDocument();
  });
});
