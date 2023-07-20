import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { CRED } from "@/types/type";

export const fetchAsyncLogin = createAsyncThunk(
  "auth/login",
  async (auth: CRED, thunkAPI) => {
    try {
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
    } catch (err :any) {
        // エラーレスポンスのデータをペイロードとして返します。
        return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const fetchAsyncRegister = createAsyncThunk(
  "auth/register",
  async (auth: CRED, thunkAPI) => {
      try {
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
    } catch (err :any) {
      // エラーレスポンスのデータをペイロードとして返します。
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);