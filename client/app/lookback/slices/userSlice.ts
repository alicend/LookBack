import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AUTHENTICATION } from "@/types/AuthType";
import { RootState } from "@/store/store";
import { USER, USER_STATE } from "@/types/UserType";
import { PAYLOAD } from "@/types/ResponseType";
import router from "next/router";

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
  USERS: `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/users`,
}

export const fetchAsyncLogin = createAsyncThunk("auth/login", async (auth: AUTHENTICATION, thunkAPI) => {
  try {
    const res = await axios.post(ENDPOINTS.LOGIN, auth, COMMON_HTTP_HEADER);
    return res.data;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

export const fetchAsyncRegister = createAsyncThunk("auth/register", async (auth: AUTHENTICATION, thunkAPI) => {
  try {
    const res = await axios.post(ENDPOINTS.REGISTER, auth, COMMON_HTTP_HEADER);
    return res.data;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

export const fetchAsyncGetLoginUser = createAsyncThunk("user", async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${ENDPOINTS.USERS}/me`, COMMON_HTTP_HEADER);
    return res.data.user;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

const initialState: USER_STATE = {
  status: "",
  loginUser: {
    ID: 0,
    Name: "",
  },
};

const handleError = (state:any, action: any) => {
  const payload = action.payload as PAYLOAD;
  if (payload.status === 401) {
    router.push("/");
  } else {
    const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
    alert(errorMessage);
    state.status = 'failed';
    state.message = errorMessage;
  }
};

const handleLoading = (state: any) => {
  state.status = 'loading';
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoginUser: (state, action) => {
      state.loginUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAsyncGetLoginUser.fulfilled, (state, action: PayloadAction<USER>) => {
      state.status = 'succeeded';
      state.loginUser = action.payload;
    });
    builder.addCase(fetchAsyncGetLoginUser.rejected, handleError);
    builder.addCase(fetchAsyncGetLoginUser.pending, handleLoading);
  }
});


export const selectLoginUser = (state: RootState) => state.user.loginUser;

export default userSlice.reducer;
