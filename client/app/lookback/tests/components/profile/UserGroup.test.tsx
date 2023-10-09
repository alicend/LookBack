import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { RenderResult } from "@testing-library/react";
import { store } from "../../../store/store";
import UserGroup from "@/components/profile/UserGroup";
import { USER_GROUP } from "@/types/UserGroupType";

const testUserGroup: USER_GROUP = {
  ID: 123,
  UserGroup: "TestGroup",
};

describe("<UserGroup />", () => {
  let getByLabelText: RenderResult["getByLabelText"];
  let getByText: RenderResult["getByText"];

  beforeEach(() => {
    const rendered = render(
      <Provider store={store}>
        <UserGroup userGroup={testUserGroup} loginStatus={false} />
      </Provider>,
    );
    getByLabelText = rendered.getByLabelText;
    getByText = rendered.getByText;
  });

  test("renders UserGroup component correctly", () => {
    expect(getByLabelText("Current User Group")).toHaveValue("TestGroup");
  });

  test("sets the new user group value correctly", () => {
    const newUserGroupInput = getByLabelText("New User Group");
    fireEvent.change(newUserGroupInput, { target: { value: "NewGroup" } });
    expect(newUserGroupInput).toHaveValue("NewGroup");
  });

  // このテストはアクションがディスパッチされたかを確認する方法を追加するか、
  // テストを削除またはコメントアウトする必要があります。
  test("dispatches the update action on button click", () => {
    const newUserGroupInput = getByLabelText("New User Group");
    fireEvent.change(newUserGroupInput, { target: { value: "NewGroup" } });
    fireEvent.click(getByText("UPDATE"));
  });
});
