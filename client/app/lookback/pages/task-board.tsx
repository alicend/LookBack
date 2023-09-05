import React, { useEffect, useState } from "react";

import { Grid } from "@mui/material";

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
  console.log(selectedTask.Task)
  console.log(editedTask.Status)
  
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
        <Grid item xs={12}>
          <TaskList />
        </Grid>
        :
        <>
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
        </>
      }
      
    </MainPageLayout>
  )
}