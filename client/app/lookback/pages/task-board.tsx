import React, { useEffect, useState } from "react";

import { Snackbar, Alert } from '@mui/material';
import { Grid } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { useSelector, useDispatch } from "react-redux";
import {
  fetchAsyncGetTasks,
  fetchAsyncGetUsers,
  fetchAsyncGetCategory,
  selectEditedTask,
  selectStatus,
  selectMessage
} from "@/slices/taskSlice";

import TaskList from '@/components/task/TaskList';
import TaskForm from "@/components/task/TaskForm";
import TaskDisplay from "@/components/task/TaskDisplay";

import { AppDispatch } from "@/store/store";
import { MainPageLayout } from "@/components/layout/MainPageLayout";

const theme = createTheme({
  palette: {
    secondary: {
      main: "#3cb371",
    },
  },
});

export default function TaskBoard() {

  const dispatch: AppDispatch = useDispatch();
  const status = useSelector(selectStatus);
  const message = useSelector(selectMessage);
  const editedTask = useSelector(selectEditedTask);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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
      await dispatch(fetchAsyncGetTasks());
      await dispatch(fetchAsyncGetUsers());
      await dispatch(fetchAsyncGetCategory());
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <MainPageLayout title="Task Board">
      <ThemeProvider theme={theme}>
        <Grid item xs={6}>
          <TaskList />
        </Grid>
        <Grid item xs={6}>
          <Grid
            container
            direction="column"
            alignItems="center"
            style={{ minHeight: "80vh" }}
          >
            <Grid item>
              {editedTask.Status ? <TaskForm /> : <TaskDisplay />}
            </Grid>
          </Grid>
        </Grid>
      </ThemeProvider>
      <Snackbar open={snackbarOpen} autoHideDuration={6000}>
        <Alert onClose={handleSnackbarClose} severity={status === 'failed' ? 'error' : 'success'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainPageLayout>
  )
}