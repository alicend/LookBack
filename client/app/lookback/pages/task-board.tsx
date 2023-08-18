import React, { useEffect, useState } from "react";

import { Snackbar, Alert } from '@mui/material';
import { Grid } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { useSelector, useDispatch } from "react-redux";
import {
  fetchAsyncGetTaskBoardTasks,
  fetchAsyncGetUsers,
  fetchAsyncGetCategory,
  selectEditedTask,
  editTask,
  initialState,
  selectTask
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
  const editedTask = useSelector(selectEditedTask);
  
  useEffect(() => {
    const fetchBootLoader = async () => {
      await dispatch(fetchAsyncGetTaskBoardTasks());
      await dispatch(fetchAsyncGetUsers());
      await dispatch(fetchAsyncGetCategory());
    };
    fetchBootLoader();
  }, [dispatch]);

  useEffect(() => {
    dispatch(editTask(initialState.editedTask));
    dispatch(selectTask(initialState.selectedTask));
  }, []);

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
    </MainPageLayout>
  )
}