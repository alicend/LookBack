import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  AUTH_STATE,
  CRED,
  LOGIN_USER,
  POST_PROFILE,
  PROFILE,
  JWT,
  USER,
} from "@/types/type";
import router from "next/router";

export const fetchAsyncLogin = createAsyncThunk(
  "auth/login",
  async (auth: CRED) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/auth/login`,
      auth,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return { data: res.data, status: res.status };
  }
);

export const fetchAsyncRegister = createAsyncThunk(
  "auth/register",
  async (auth: CRED) => {
    console.log(auth);
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/auth/signup`,
      auth,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  }
);