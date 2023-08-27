import React, { useEffect, useState } from "react";

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

const StyledContainer = styled('div')`
  color: gray-500;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '470px',
}));

export default function Profile() {
  const dispatch: AppDispatch = useDispatch();
  const loginUser = useSelector(selectLoginUser);
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
              <Tab label="User Name" />
              <Tab label="Password" />
              <Tab label="User Group" />
              <Tab label="Delete" />
            </Tabs>
          </StyledPaper>
          <br />
          {tabValue === 0 && loginUser && <UserName loginUserName={loginUser.Name} />}
          {tabValue === 1 && loginUser && <Password/>}
          {tabValue === 2 && loginUser && <UserGroup userGroup={{ID: loginUser.UserGroupID, UserGroup: loginUser.UserGroup}}/>}
          {tabValue === 3 && loginUser && <Delete loginUserName={loginUser.Name} />}          
        </StyledContainer>
      </Grid>
    </MainPageLayout>
  );
};