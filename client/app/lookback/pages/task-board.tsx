import React, { useEffect, useState } from "react";

import { Box, Grid } from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import {
  fetchAsyncGetTaskBoardTasks,
  fetchAsyncGetUsers,
  fetchAsyncGetCategory,
  selectEditedTask,
  editTask,
  initialState,
  selectTask,
  selectSelectedTask
} from "@/slices/taskSlice";

import TaskList from '@/components/task/TaskList';
import TaskForm from "@/components/task/TaskForm";
import TaskDisplay from "@/components/task/TaskDisplay";

import { AppDispatch } from "@/store/store";
import { MainPageLayout } from "@/components/layout/MainPageLayout";

export default function TaskBoard() {

  const dispatch: AppDispatch = useDispatch();
  const editedTask = useSelector(selectEditedTask);
  const selectedTask = useSelector(selectSelectedTask);
  
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
      
      {!editedTask.Status && !selectedTask.Task ?
        <Grid container justifyContent="center">
          <TaskList />
        </Grid>
        :
        <>
          <Grid item xs={12} sm={6}>
            <Box marginBottom={4}>
              <TaskList />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            {editedTask.Status ? <TaskForm /> : <TaskDisplay />}
          </Grid>
        </>
      }
      
    </MainPageLayout>
  )
}