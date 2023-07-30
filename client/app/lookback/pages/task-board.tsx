import React, { useEffect, useState } from "react";

import { Snackbar, Alert } from '@mui/material';
import { Grid, Menu } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
import { IconMenu } from '@/components/IconMenu';
import { HomeLayout } from "@/components/HomeLayout";

const theme = createTheme({
  palette: {
    secondary: {
      main: "#3cb371",
    },
  },
});

export default function MainPage() {

  const dispatch: AppDispatch = useDispatch();
  const status = useSelector(selectStatus);
  const message = useSelector(selectMessage);
  const editedTask = useSelector(selectEditedTask);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
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
      await dispatch(fetchAsyncGetTasks());
      await dispatch(fetchAsyncGetUsers());
      await dispatch(fetchAsyncGetCategory());
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <HomeLayout title="Task Board">
      <ThemeProvider theme={theme}>
        <div className="text-center bg-white text-gray-600 font-serif m-6">
          <Grid container>
            <Grid item xs={4} className="border-b border-gray-400 mb-5">
            </Grid>
            <Grid item xs={4} className="border-b border-gray-400 mb-5">
              <h1>Task Board</h1>
            </Grid>
            <Grid item xs={4} className="border-b border-gray-400 mb-5">
              <div className="flex justify-end">
                <button
                  className="bg-transparent mb-2 mr-3 border-none outline-none cursor-pointer"
                  aria-controls="menu" 
                  aria-haspopup="true" 
                  onClick={handleClick}
                >
                  <MoreVertIcon/>
                </button>
                <Menu
                  id="menu"
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
        <Snackbar open={snackbarOpen} autoHideDuration={6000}>
          <Alert onClose={handleSnackbarClose} severity={status === 'failed' ? 'error' : 'success'}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </HomeLayout>
  )
}