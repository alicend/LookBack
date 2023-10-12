import React, { ReactNode } from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "@/store/store";
import TaskList from "@/components/task/TaskList";
import { editTasks } from "@/slices/taskSlice";

jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  Hidden: ({ children }: { children: ReactNode }) => children,
}));

describe("<TaskList />", () => {
  beforeEach(() => {
    store.dispatch(
      editTasks([
        {
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
        },
        {
          ID: 2,
          Task: "Test task2",
          Description: "Test description2",
          StartDate: "2023-11-01",
          Status: 2,
          StatusName: "進行中",
          Category: 2,
          CategoryName: "CategoryName2",
          Estimate: 6,
          Responsible: 3,
          ResponsibleUserName: "ResponsibleUserName2",
          Creator: 4,
          CreatorUserName: "CreatorUserName2",
          CreatedAt: "2023-11-02",
          UpdatedAt: "2023-11-03",
        },
      ]),
    );
  });

  test("renders without crashing", () => {
    render(
      <Provider store={store}>
        <TaskList />
      </Provider>,
    );
  });

  test("displays 'Add new' button", () => {
    const { getByText } = render(
      <Provider store={store}>
        <TaskList />
      </Provider>,
    );
    expect(getByText("Add new")).toBeInTheDocument();
  });

  test("sorts the tasks when header elements is clicked", () => {
    const { getAllByText } = render(
      <Provider store={store}>
        <TaskList />
      </Provider>,
    );

    const headerTask = getAllByText("Task");
    fireEvent.click(headerTask[0]);
    fireEvent.click(headerTask[1]);

    const headerStatus = getAllByText("Status");
    fireEvent.click(headerStatus[0]);
    fireEvent.click(headerStatus[1]);

    const headerEstimate = getAllByText("Estimate [days]");
    fireEvent.click(headerEstimate[0]);

    const headerStartDate = getAllByText("StartDate");
    fireEvent.click(headerStartDate[0]);

    const headerResponsible = getAllByText("Responsible");
    fireEvent.click(headerResponsible[0]);

    const headerCreator = getAllByText("Creator");
    fireEvent.click(headerCreator[0]);
  });

  test("open Update Task Component", () => {
    const { getAllByText } = render(
      <Provider store={store}>
        <TaskList />
      </Provider>,
    );

    const headerTask = getAllByText("Test task");
    fireEvent.click(headerTask[0]);
  });

  test("open Update Task Component", () => {
    const { getAllByText } = render(
      <Provider store={store}>
        <TaskList />
      </Provider>,
    );

    const headerTask = getAllByText("Test task");
    fireEvent.click(headerTask[0]);
  });
});
