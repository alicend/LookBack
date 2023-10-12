import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import dayjs from "dayjs";
import { store } from "@/store/store";
import TaskForm from "@/components/task/TaskForm";
import { editTask } from "@/slices/taskSlice";

describe("<TaskForm />", () => {
  beforeEach(() => {
    store.dispatch(
      editTask({
        ID: 0,
        Task: "",
        Description: "",
        StartDate: dayjs().toISOString(),
        Responsible: 0,
        Status: 1,
        Category: 0,
        Estimate: 1,
      }),
    );
  });

  test("renders TaskForm component correctly", () => {
    const { getByLabelText, getByText } = render(
      <Provider store={store}>
        <TaskForm />
      </Provider>,
    );

    expect(getByLabelText("Start Date")).toBeInTheDocument();
    expect(getByLabelText("Estimate [days]")).toBeInTheDocument();
    expect(getByLabelText("Task")).toBeInTheDocument();
    expect(getByLabelText("Description")).toBeInTheDocument();
    expect(getByText("Responsible")).toBeInTheDocument();
    expect(getByText("Status")).toBeInTheDocument();
    expect(getByText("Category")).toBeInTheDocument();
    expect(getByText("Save")).toBeInTheDocument();
    expect(getByText("Cancel")).toBeInTheDocument();
  });

  test("allows user to fill the form", async () => {
    const { getByLabelText, getByText } = render(
      <Provider store={store}>
        <TaskForm />
      </Provider>,
    );

    fireEvent.change(getByLabelText("Estimate [days]"), {
      target: { value: "1" },
    });
    fireEvent.change(getByLabelText("Task"), {
      target: { value: "New Task 1" },
    });
    fireEvent.change(getByLabelText("Description"), {
      target: { value: "Description for new task 1" },
    });
  });

  test("handles save button clicks", () => {
    const { getByText } = render(
      <Provider store={store}>
        <TaskForm />
      </Provider>,
    );

    fireEvent.click(getByText("Save"));
  });

  test("handles cancel button clicks", () => {
    const { getByText, queryByText } = render(
      <Provider store={store}>
        <TaskForm />
      </Provider>,
    );

    fireEvent.click(getByText("Cancel"));
  });
});
