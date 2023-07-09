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
  selectLoginUser,
  selectProfiles,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
  fetchAsyncUpdateProf,
} from "@/reducer/authSlice";
import {
  fetchAsyncGetTasks,
  fetchAsyncGetUsers,
  fetchAsyncGetCategory,
  selectEditedTask
} from "@/reducer/taskSlice";

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

  const loginUser = useSelector(selectLoginUser);
  const profiles = useSelector(selectProfiles);

  const loginProfile = profiles.filter(
    (prof) => prof.user_profile === loginUser.id
  )[0];

  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imageInput");
    fileInput?.click();
  };

  const router = useRouter();
  const Logout = async () => {
    try {
      const res: AxiosResponse<ResponseData> = await axios.get(
          `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/auth/logout`,
          { headers: {
              "Content-Type": "application/json"
            }
          }
      );
      console.log(res);
    } catch (err: any) {
      console.log(err);
    }
    router.push("/");
  };

  // useEffect(() => {
  //   const fetchBootLoader = async () => {
  //     await dispatch(fetchAsyncGetTasks());
  //     await dispatch(fetchAsyncGetMyProf());
  //     await dispatch(fetchAsyncGetUsers());
  //     await dispatch(fetchAsyncGetCategory());
  //     await dispatch(fetchAsyncGetProfs());
  //   };
  //   fetchBootLoader();
  // }, [dispatch]);

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
                <input
                  type="file"
                  id="imageInput"
                  hidden={true}
                  onChange={(e) => {
                    dispatch(
                      fetchAsyncUpdateProf({
                        id: loginProfile.id,
                        img: e.target.files !== null ? e.target.files[0] : null,
                      })
                    );
                  }}
                />
                <button className="bg-transparent pt-1 border-none outline-none cursor-pointer" onClick={handlerEditPicture}>
                  <StyledAvatar
                    alt="avatar"
                    src={
                      loginProfile?.img !== null ? loginProfile?.img : undefined
                    }
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
                  {editedTask.status ? <TaskForm /> : <TaskDisplay />}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </ThemeProvider>
      {/* <svg
        onClick={logout}
        xmlns="http://www.w3.org/2000/svg"
        className="mt-10 cursor-pointer h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg> */}
    </>
  )
}