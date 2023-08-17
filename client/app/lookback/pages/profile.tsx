import React, { useEffect, useState } from "react";

import { styled } from '@mui/system';
import { TextField, Button, Grid, Snackbar, Alert, Paper, Tab, Tabs } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchAsyncGetLoginUser, selectLoginUser, selectMessage, selectStatus } from "@/slices/userSlice";

import { MainPageLayout } from "@/components/layout/MainPageLayout";
import Password from "@/components/profile/Password";
import UserName from "@/components/profile/UserName";
import Delete from "@/components/profile/Delete";
import UserGroup from "@/components/profile/UserGroup";
import { fetchAsyncGetUserGroups } from "@/slices/userGroupSlice";

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
  const status = useSelector(selectStatus);
  const message = useSelector(selectMessage);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (status === 'succeeded' || status === 'failed') {
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    } else if (status === 'loading') {
      setSnackbarOpen(false);
    }
  }, [status]);
  
  useEffect(() => {
    const fetchBootLoader = async () => {
      await dispatch(fetchAsyncGetLoginUser());
      await dispatch(fetchAsyncGetUserGroups());
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
          {tabValue === 0 && <UserName loginUserName={loginUser.Name} />}
          {tabValue === 1 && <Password/>}
          {tabValue === 2 && <UserGroup/>}
          {tabValue === 3 && <Delete loginUserName={loginUser.Name} />}          
        </StyledContainer>
      </Grid>
      <Snackbar open={snackbarOpen} autoHideDuration={6000}>
        <Alert onClose={handleSnackbarClose} severity={status === 'failed' ? 'error' : 'success'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainPageLayout>
  );
};