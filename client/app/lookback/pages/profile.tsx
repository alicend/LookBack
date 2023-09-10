import { Grid, Paper, Tab, Tabs } from "@mui/material";
import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import Cookies from "universal-cookie";
import { AppDispatch } from "../store/store";

import { MainPageLayout } from "@/components/layout/MainPageLayout";
import Delete from "@/components/profile/Delete";
import Email from "@/components/profile/Email";
import Password from "@/components/profile/Password";
import UserGroup from "@/components/profile/UserGroup";
import UserName from "@/components/profile/UserName";
import { fetchAsyncGetLoginUser, selectLoginUser } from "@/slices/userSlice";

export default function Profile() {
  const dispatch: AppDispatch = useDispatch();
  const loginUser = useSelector(selectLoginUser);
  const [isGuestLogin, setGuestLogin] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchBootLoader = async () => {
      await dispatch(fetchAsyncGetLoginUser());
    };
    fetchBootLoader();
  }, [dispatch]);

  useEffect(() => {
    const cookies = new Cookies();
    setGuestLogin(cookies.get("guest_login"));
  }, []);

  return (
    <MainPageLayout title="Profile Edit">
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: "80vh" }}
      >
        {isGuestLogin && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"
            role="alert"
          >
            <p>You cannot edit your profile while logged in as a guest.</p>
          </div>
        )}
        <Grid container justifyContent="center" mb={3}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
          >
            <Tab label="Email" />
            <Tab label="Password" />
            <Tab label="User Name" />
            <Tab label="User Group" />
            <Tab label="Delete" />
          </Tabs>
        </Grid>

        {tabValue === 0 && loginUser && (
          <Email loginUserEmail={loginUser.Email} loginStatus={isGuestLogin} />
        )}
        {tabValue === 1 && loginUser && <Password loginStatus={isGuestLogin} />}
        {tabValue === 2 && loginUser && (
          <UserName loginUserName={loginUser.Name} loginStatus={isGuestLogin} />
        )}
        {tabValue === 3 && loginUser && (
          <UserGroup
            userGroup={{
              ID: loginUser.UserGroupID,
              UserGroup: loginUser.UserGroup,
            }}
            loginStatus={isGuestLogin}
          />
        )}
        {tabValue === 4 && loginUser && (
          <Delete
            loginUserName={loginUser.Name}
            userGroup={{
              ID: loginUser.UserGroupID,
              UserGroup: loginUser.UserGroup,
            }}
            loginStatus={isGuestLogin}
          />
        )}
      </Grid>
    </MainPageLayout>
  );
}
