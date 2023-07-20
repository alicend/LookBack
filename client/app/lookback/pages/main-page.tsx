import axios, { AxiosResponse, AxiosError } from 'axios';
import { useRouter } from "next/router"; 
import React, { useEffect } from "react";

import { Grid, Avatar } from "@mui/material";
import { styled } from '@mui/system';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
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

interface ResponseData {
  access: string;
}

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

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

export default function MainPage() {

  const dispatch: AppDispatch = useDispatch();
  const editedTask = useSelector(selectEditedTask);

  const router = useRouter();
  const Logout = async () => {
    try {
      const res: AxiosResponse<ResponseData> = await axios.get(
          `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/auth/logout`,
          { headers: { "Content-Type": "application/json" } }
      );
      console.log(res);
    } catch (err: any) {
      console.log(err);
    }
    router.push("/");
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
              <StyledIcon />
            </Grid>
            <Grid item xs={4}>
              <h1>Scrum Task Board</h1>
            </Grid>
            <Grid item xs={4}>
              <div className="mt-5 flex justify-end">
                <button className="bg-transparent text-gray-600 mt-1 border-none outline-none cursor-pointer" onClick={Logout}>
                  <ExitToAppIcon fontSize="large" />
                </button>
                <button className="bg-transparent pt-1 border-none outline-none cursor-pointer">
                  <StyledAvatar
                    alt="avatar"
                  />
                </button>
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
                justifyContent="center"
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