import React, { useEffect, useState } from "react";
import Cookies from 'universal-cookie';

import { styled } from '@mui/system';
import { Grid, Paper, Tab, Tabs } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchAsyncGetLoginUser, selectLoginUser } from "@/slices/userSlice";

import { MainPageLayout } from "@/components/layout/MainPageLayout";
import Password from "@/components/profile/Password";
import UserName from "@/components/profile/UserName";
import Delete from "@/components/profile/Delete";
import UserGroup from "@/components/profile/UserGroup";
import Email from "@/components/profile/Email";

const StyledContainer = styled('div')`
  color: gray-500;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '550px',
}));

export default function Profile() {
  const dispatch: AppDispatch = useDispatch();
  const loginUser = useSelector(selectLoginUser);
  const cookies = new Cookies();
  const isGuestLogin = cookies.get('guest_login');
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

  return (
    <MainPageLayout title="Profile Edit">
      <Grid item xs={12}>
        <StyledContainer>
          <StyledPaper elevation={0}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label="Email" />
              <Tab label="Password" />
              <Tab label="User Name" />
              <Tab label="User Group" />
              <Tab label="Delete" />
            </Tabs>
          </StyledPaper>
          <br />
          {tabValue === 0 && loginUser && <Email loginUserEmail={loginUser.Email} loginStatus={isGuestLogin} />}
          {tabValue === 1 && loginUser && <Password loginStatus={isGuestLogin} />}
          {tabValue === 2 && loginUser && <UserName loginUserName={loginUser.Name} loginStatus={isGuestLogin}/>}
          {tabValue === 3 && loginUser && <UserGroup userGroup={{ID: loginUser.UserGroupID, UserGroup: loginUser.UserGroup}} loginStatus={isGuestLogin} />}
          {tabValue === 4 && loginUser && <Delete loginUserName={loginUser.Name } userGroup={{ID: loginUser.UserGroupID, UserGroup: loginUser.UserGroup}} loginStatus={isGuestLogin} />}          
        </StyledContainer>
      </Grid>
    </MainPageLayout>
  );
};