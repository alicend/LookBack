import axios, { AxiosResponse, AxiosError } from 'axios';
import { useRouter } from "next/router"; 
import React, { useEffect, useState } from "react";

import { Grid, Menu } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/system';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

import { useSelector, useDispatch } from "react-redux";
import {
  fetchAsyncGetTasks,
  fetchAsyncGetUsers,
  fetchAsyncGetCategory,
  selectEditedTask
} from "@/slices/taskSlice";

import TaskList from '@/components/task/TaskList';
import TaskForm from "@/components/task/TaskForm";
import TaskDisplay from "@/components/task/TaskDisplay";

import { AppDispatch } from "@/store/store";
import { IconMenu } from '@/components/IconMenu';

const theme = createTheme({
  palette: {
    secondary: {
      main: "#3cb371",
    },
  },
});

const StyledIcon = styled(RadioButtonCheckedIcon)(({ theme }) => ({
  marginTop: theme.spacing(3),
  cursor: "none",
}));

export default function MainPage() {

  const dispatch: AppDispatch = useDispatch();
  const editedTask = useSelector(selectEditedTask);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchBootLoader = async () => {
      await dispatch(fetchAsyncGetTasks());
      await dispatch(fetchAsyncGetUsers());
      await dispatch(fetchAsyncGetCategory());
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <div className="text-center bg-white text-gray-600 font-serif m-6">
          <Grid container>
            <Grid item xs={4}>
            </Grid>
            <Grid item xs={4}>
              <h1>Task Board</h1>
            </Grid>
            <Grid item xs={4}>
              <div className="mt-5 flex justify-end">
                <button
                  className="bg-transparent pt-1 border-none outline-none cursor-pointer"
                  aria-controls="simple-menu" 
                  aria-haspopup="true" 
                  onClick={handleClick}
                >
                  <MoreVertIcon/>
                </button>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <IconMenu />
                </Menu>
              </div>
            </Grid>
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
          </Grid>
        </div>
      </ThemeProvider>
    </>
  )
}