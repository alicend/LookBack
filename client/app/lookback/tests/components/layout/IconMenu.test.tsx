import { render, fireEvent } from "@testing-library/react";
import { Provider, useDispatch } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "@/store/store";
import { IconMenu } from "@/components/layout/IconMenu";
import { useRouter } from "next/router";

// useRouterのモック
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("<IconMenu />", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      asPath: "/somepath", // デフォルトのパス
    });
  });

  test("renders correct icons and texts", () => {
    const { getByText } = render(
      <Provider store={store}>
        <IconMenu />
      </Provider>,
    );

    expect(getByText("Log out")).toBeInTheDocument();
    expect(getByText("Look Back")).toBeInTheDocument();
    expect(getByText("Task Board")).toBeInTheDocument();
    expect(getByText("Profile Edit")).toBeInTheDocument();
    expect(getByText("Invite to User Group")).toBeInTheDocument();
  });

  test("does not render Look Back menu item when current page is /look-back", () => {
    (useRouter as jest.Mock).mockReturnValue({
      asPath: "/look-back",
    });

    const { queryByText } = render(
      <Provider store={store}>
        <IconMenu />
      </Provider>,
    );

    expect(queryByText("Look Back")).toBeNull();
  });

  test("does not render Task Board menu item when current page is /task-board", () => {
    (useRouter as jest.Mock).mockReturnValue({
      asPath: "/task-board",
    });

    const { queryByText } = render(
      <Provider store={store}>
        <IconMenu />
      </Provider>,
    );

    expect(queryByText("Task Board")).toBeNull();
  });

  test("does not render Profile Edit menu item when current page is /profile", () => {
    (useRouter as jest.Mock).mockReturnValue({
      asPath: "/profile",
    });

    const { queryByText } = render(
      <Provider store={store}>
        <IconMenu />
      </Provider>,
    );

    expect(queryByText("Profile Edit")).toBeNull();
  });

  test("does not render Invite to User Group menu item when current page is /invite", () => {
    (useRouter as jest.Mock).mockReturnValue({
      asPath: "/invite",
    });

    const { queryByText } = render(
      <Provider store={store}>
        <IconMenu />
      </Provider>,
    );

    expect(queryByText("Invite to User Group")).toBeNull();
  });
});
