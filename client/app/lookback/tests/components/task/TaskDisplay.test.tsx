import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "@/store/store";
import TaskDisplay from "@/components/task/TaskDisplay";
import { editSelectedTask } from "@/slices/taskSlice";

describe("<TaskDisplay />", () => {
  beforeEach(() => {
    store.dispatch(
      editSelectedTask({
        ID: 1,
        Task: "Test task",
        Description: "Test description",
        StartDate: "2023-10-01",
        Status: 1,
        StatusName: "未着",
        Category: 1,
        CategoryName: "CategoryName",
        Estimate: 3,
        Responsible: 1,
        ResponsibleUserName: "ResponsibleUserName",
        Creator: 2,
        CreatorUserName: "CreatorUserName",
        CreatedAt: "2023-10-02",
        UpdatedAt: "2023-10-03",
      }),
    );
  });

  test("renders TaskDisplay component correctly", () => {
    const { getByText } = render(
      <Provider store={store}>
        <TaskDisplay />
      </Provider>,
    );

    expect(getByText("Task details")).toBeInTheDocument();
    expect(getByText("Test task")).toBeInTheDocument();
    expect(getByText("Test description")).toBeInTheDocument();
    expect(getByText("CreatorUserName")).toBeInTheDocument();
    expect(getByText("ResponsibleUserName")).toBeInTheDocument();
    expect(getByText("2023-10-01")).toBeInTheDocument();
    expect(getByText("3")).toBeInTheDocument();
    expect(getByText("CreatorUserName")).toBeInTheDocument();
    expect(getByText("未着")).toBeInTheDocument();
    expect(getByText("2023-10-02")).toBeInTheDocument();
    expect(getByText("2023-10-03")).toBeInTheDocument();

    expect(getByText("Cancel")).toBeInTheDocument();
  });

  test("dispatches actions correctly when Cancel button is clicked", () => {
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <TaskDisplay />
      </Provider>,
    );

    expect(getByText("Test task")).toBeInTheDocument();
    fireEvent.click(getByText("Cancel"));
    expect(queryByText("Test task")).not.toBeInTheDocument();
  });
});
