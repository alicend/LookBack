import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "../../../store/store";
import CalendarTaskDisplay from "@/components/calendar/CalendarTaskDisplay";
import { selectTask } from "@/slices/taskSlice";

describe("<CalendarTaskDisplay />", () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    store.dispatch(selectTask({
        ID: 1,
        Task: "Test task",
        Description: "Test description",
        StartDate: "2023-10-01",
        Status: 0,
        StatusName: "未着",
        Category: 1,
        CategoryName: "CategoryName",
        Estimate: 3,
        Responsible: 1,
        ResponsibleUserName: "ResponsibleUserName",
        Creator: 2,
        CreatorUserName: "CreatorUserName",
        CreatedAt: "2023-10-02",
        UpdatedAt: "2023-10-03"
      }));
    
  });

  test("renders task details correctly", () => {
    render(
      <Provider store={store}>
        <CalendarTaskDisplay onClose={onCloseMock} />
      </Provider>,
    );

    expect(screen.getByText("Task details")).toBeInTheDocument();
    expect(screen.getByText("Test task")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("CreatorUserName")).toBeInTheDocument();
    expect(screen.getByText("ResponsibleUserName")).toBeInTheDocument();
    expect(screen.getByText("2023-10-01")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("CategoryName")).toBeInTheDocument();
    expect(screen.getByText("2023-10-02")).toBeInTheDocument();
    expect(screen.getByText("2023-10-03")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /To Task Board/ })).toBeInTheDocument();
  });

});
