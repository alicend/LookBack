import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "../../../store/store";
import Delete from "@/components/profile/Delete";

const mockUserGroup = {
  ID: 123,
  UserGroup: "Test Group",
};

describe("<Delete />", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <Delete
          loginUserName="TestUser"
          userGroup={mockUserGroup}
          loginStatus={false}
        />
      </Provider>,
    );
  });

  test("should render both delete buttons", () => {
    expect(screen.getByText("USER DELETE")).toBeInTheDocument();
    expect(screen.getByText("USER GROUP DELETE")).toBeInTheDocument();
  });

  test("should open user delete dialog on button click", () => {
    fireEvent.click(screen.getByText("USER DELETE"));
    expect(
      screen.getByText(
        /ユーザー「TestUser」に関連するタスクも削除されますが本当に削除してよろしいですか？/,
      ),
    ).toBeInTheDocument();
  });

  test("should open user group delete dialog on button click", () => {
    fireEvent.click(screen.getByText("USER GROUP DELETE"));
    expect(
      screen.getByText(
        /ユーザーグループ「Test Group」に所属するユーザーも削除されますが本当に削除してよろしいですか？/,
      ),
    ).toBeInTheDocument();
  });
});
