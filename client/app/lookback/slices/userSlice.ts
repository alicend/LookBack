import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { AUTHENTICATION } from "@/types/AuthType";

// 共通のHTTPヘッダー
const COMMON_HTTP_HEADER = {
  headers: {
    "Content-Type": "application/json",
  },
};

// 共通のエラーハンドラ
const handleHttpError = (err: any, thunkAPI: any) => {
  return thunkAPI.rejectWithValue({
    response: err.response.data, 
    status: err.response.status
  });
}

// APIエンドポイントの定義
const ENDPOINTS = {
  LOGIN: `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/auth/login`,
  REGISTER: `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/auth/signup`,
}

export const fetchAsyncLogin = createAsyncThunk(
  "auth/login",
  async (auth: AUTHENTICATION, thunkAPI) => {
    try {
      const res = await axios.post(ENDPOINTS.LOGIN, auth, COMMON_HTTP_HEADER);
      return res.data.user;
    } catch (err :any) {
      return handleHttpError(err, thunkAPI);
    }
  }
);

export const fetchAsyncRegister = createAsyncThunk(
  "auth/register",
  async (auth: AUTHENTICATION, thunkAPI) => {
    try {
      const res = await axios.post(ENDPOINTS.REGISTER, auth, COMMON_HTTP_HEADER);
      return res.data;
    } catch (err :any) {
      return handleHttpError(err, thunkAPI);
    }
  }
);
