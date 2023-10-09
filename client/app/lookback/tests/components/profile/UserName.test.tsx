import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "@/store/store";
import UserName from "@/components/profile/UserName";

describe("<UserName />", () => {
  const testUserName = "TestUser";

  test("renders UserName component correctly", () => {
    const { getByLabelText } = render(
      <Provider store={store}>
        <UserName loginUserName={testUserName} loginStatus={false} />
      </Provider>
    );

    expect(getByLabelText("Current Username")).toHaveValue(testUserName);
  });

  test("sets the new username value correctly", () => {
    const { getByLabelText } = render(
      <Provider store={store}>
        <UserName loginUserName={testUserName} loginStatus={false} />
      </Provider>
    );

    const newUsernameInput = getByLabelText("New Username");
    fireEvent.change(newUsernameInput, { target: { value: "NewUser" } });
    expect(newUsernameInput).toHaveValue("NewUser");
  });

  test("shows an error when trying to set the new username to the current username", async () => {
    const { getByLabelText, getByText, findByText } = render(
      <Provider store={store}>
        <UserName loginUserName={testUserName} loginStatus={false} />
      </Provider>
    );

    const newUsernameInput = getByLabelText("New Username");
    fireEvent.change(newUsernameInput, { target: { value: testUserName } });

    const updateButton = getByText("UPDATE");
    fireEvent.click(updateButton);

    const errorMessage = await findByText(
      "新しいユーザー名は現在のユーザー名と異なるものにしてください"
    );
    expect(errorMessage).toBeInTheDocument();
  });

  test("dispatches the update action on button click", async () => {
    const { getByLabelText, getByText } = render(
      <Provider store={store}>
        <UserName loginUserName={testUserName} loginStatus={false} />
      </Provider>
    );

    const newUsernameInput = getByLabelText("New Username");
    fireEvent.change(newUsernameInput, { target: { value: "NewUser" } });

    const updateButton = getByText("UPDATE");
    fireEvent.click(updateButton);
  });
});
