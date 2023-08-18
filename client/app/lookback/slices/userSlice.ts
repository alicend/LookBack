import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AUTHENTICATION } from "@/types/AuthType";
import { RootState } from "@/store/store";
import { USER, USER_STATE, PASSWORD_UPDATE } from "@/types/UserType";
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
    console.log(auth)
    const res = await axios.post(ENDPOINTS.REGISTER, auth, COMMON_HTTP_HEADER);
    return res.data;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

export const fetchAsyncGetLoginUser = createAsyncThunk("users/getUser", async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${ENDPOINTS.USERS}/me`, COMMON_HTTP_HEADER);
    return res.data.user;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

export const fetchAsyncUpdateLoginUsername = createAsyncThunk("users/updateUsername", async (username: string, thunkAPI) => {
  try {
    const res = await axios.put(`${ENDPOINTS.USERS}/me/name`, {username: username}, COMMON_HTTP_HEADER);
    return res.data.user;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

export const fetchAsyncUpdateLoginUserPassword = createAsyncThunk("users/updateUserPassword", async (passwords: PASSWORD_UPDATE, thunkAPI) => {
  try {
    const res = await axios.put(`${ENDPOINTS.USERS}/me/password`, passwords, COMMON_HTTP_HEADER);
    return res.data.user;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

export const fetchAsyncUpdateLoginUserGroup = createAsyncThunk("users/updateUserGroup", async (user_group_id: number, thunkAPI) => {
  try {
    const res = await axios.put(`${ENDPOINTS.USERS}/me/user-group`, {user_group_id: user_group_id}, COMMON_HTTP_HEADER);
    return res.data.user;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

export const fetchAsyncDeleteLoginUser = createAsyncThunk("users/deleteUser", async (_, thunkAPI) => {
  try {
    const res = await axios.delete(`${ENDPOINTS.USERS}/me`, COMMON_HTTP_HEADER);
    return res.data.user;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

const initialState: USER_STATE = {
  status: "",
  message: "",
  loginUser: {
    ID: 0,
    Name: "",
    UserGroupID: 0,
  },
};

const handleError = (state:any, action: any) => {
  const payload = action.payload as PAYLOAD;
  if (payload.status === 401) {
    router.push("/");
  } else {
    const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
    state.status = 'failed';
    state.message = errorMessage;
  }
};

const handleLoginError = (state:any, action: any) => {
  const payload = action.payload as PAYLOAD;
  const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
  state.status = 'failed';
  state.message = errorMessage;
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
    builder.addCase(fetchAsyncLogin.fulfilled, (state, action: PayloadAction<USER>) => {
      state.loginUser = action.payload;
      router.push("/task-board");
    });
    builder.addCase(fetchAsyncLogin.rejected, handleLoginError);
    builder.addCase(fetchAsyncLogin.pending, handleLoading);
    builder.addCase(fetchAsyncRegister.fulfilled, (state, action: PayloadAction<USER>) => {
      state.status = 'succeeded';
      state.loginUser = action.payload;
      state.message = 'ユーザーの登録に成功しました';
    });
    builder.addCase(fetchAsyncRegister.rejected, handleLoginError);
    builder.addCase(fetchAsyncRegister.pending, handleLoading);
    builder.addCase(fetchAsyncGetLoginUser.fulfilled, (state, action: PayloadAction<USER>) => {
      state.loginUser = action.payload;
    });
    builder.addCase(fetchAsyncGetLoginUser.rejected, handleError);
    builder.addCase(fetchAsyncGetLoginUser.pending, handleLoading);
    builder.addCase(fetchAsyncUpdateLoginUsername.fulfilled, (state, action: PayloadAction<USER>) => {
      state.status = 'succeeded';
      state.loginUser = action.payload;
      state.message = 'ユーザー名の更新に成功しました';
    });
    builder.addCase(fetchAsyncUpdateLoginUsername.rejected, handleError);
    builder.addCase(fetchAsyncUpdateLoginUsername.pending, handleLoading);
    builder.addCase(fetchAsyncUpdateLoginUserPassword.fulfilled, (state, action: PayloadAction<USER>) => {
      state.status = 'succeeded';
      state.loginUser = action.payload;
      state.message = 'パスワードの更新に成功しました';
    });
    builder.addCase(fetchAsyncUpdateLoginUserPassword.rejected, handleError);
    builder.addCase(fetchAsyncUpdateLoginUserPassword.pending, handleLoading);
    builder.addCase(fetchAsyncUpdateLoginUserGroup.fulfilled, (state, action: PayloadAction<USER>) => {
      state.status = 'succeeded';
      state.loginUser = action.payload;
      state.message = 'ユーザーグループの更新に成功しました';
    });
    builder.addCase(fetchAsyncUpdateLoginUserGroup.rejected, handleError);
    builder.addCase(fetchAsyncUpdateLoginUserGroup.pending, handleLoading);
    builder.addCase(fetchAsyncDeleteLoginUser.fulfilled, (state, action: PayloadAction<USER>) => {
      state.status = 'succeeded';
      state.loginUser = action.payload;
      state.message = 'ユーザーの削除に成功しました';
      router.push("/");
    });
    builder.addCase(fetchAsyncDeleteLoginUser.rejected, handleError);
    builder.addCase(fetchAsyncDeleteLoginUser.pending, handleLoading);
  }
});


export const selectLoginUser   = (state: RootState) => state.user.loginUser;
export const selectUserStatus  = (state: RootState) => state.user.status;
export const selectUserMessage = (state: RootState) => state.user.message;

export default userSlice.reducer;
