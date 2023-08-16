import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AUTHENTICATION } from "@/types/AuthType";
import { RootState } from "@/store/store";
import { USER, USER_STATE, USER_UPDATE } from "@/types/UserType";
import { PAYLOAD } from "@/types/ResponseType";
import router from "next/router";
import { USER_GROUP, USER_GROUP_STATE } from "@/types/UserGroupType";

// 共通のHTTPヘッダー
const COMMON_HTTP_HEADER = {
  headers: {
    "Content-Type": "application/json",
  },
};

// 共通のエラーハンドラ
const handleHttpError = (err: any, thunkAPI: any) => {
  console.log(err)
  return thunkAPI.rejectWithValue({
    response: err.response.data, 
    status: err.response.status
  });
}

// APIエンドポイントの定義
const ENDPOINTS = `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/user-groups`

export const fetchAsyncCreateUserGroup = createAsyncThunk("user-groups/create", async (UserGroup: string, thunkAPI) => {
  try {
    const res = await axios.post(ENDPOINTS, {UserGroup: UserGroup}, COMMON_HTTP_HEADER);
    return res.data.user_groups;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

export const fetchAsyncGetUserGroups = createAsyncThunk("user-groups/get", async (_, thunkAPI) => {
  try {
    const res = await axios.get(ENDPOINTS, COMMON_HTTP_HEADER);
    return res.data.user_groups;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

export const fetchAsyncUpdateUserGroup = createAsyncThunk("user-groups/update", async (_, thunkAPI) => {
  try {
    const res = await axios.put(`${ENDPOINTS}`, COMMON_HTTP_HEADER);
    return res.data.user;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

export const fetchAsyncDeleteUserGroup = createAsyncThunk("user-groups/delete", async (_, thunkAPI) => {
  try {
    const res = await axios.delete(`${ENDPOINTS}`, COMMON_HTTP_HEADER);
    return res.data.user;
  } catch (err :any) {
    return handleHttpError(err, thunkAPI);
  }
});

const initialState: USER_GROUP_STATE = {
  status: "",
  message: "",
  userGroups: [
    {
      ID: 0,
      UserGroup: "",
    },
  ],
};

const handleError = (state:any, action: any) => {
  console.log(action)
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

export const userGroupSlice = createSlice({
  name: 'userGroup',
  initialState,
  reducers: {
    setUserGroup: (state, action) => {
      state.userGroups = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAsyncCreateUserGroup.fulfilled, (state, action: PayloadAction<USER_GROUP[]>) => {
      state.status = 'succeeded';
      state.userGroups = action.payload;
      state.message = 'ユーザーグループの登録に成功しました';
    });
    builder.addCase(fetchAsyncCreateUserGroup.rejected, handleLoginError);
    builder.addCase(fetchAsyncCreateUserGroup.pending, handleLoading);
    builder.addCase(fetchAsyncGetUserGroups.fulfilled, (state, action: PayloadAction<USER_GROUP[]>) => {
      state.userGroups = action.payload;
    });
    builder.addCase(fetchAsyncGetUserGroups.rejected, handleError);
    builder.addCase(fetchAsyncGetUserGroups.pending, handleLoading);
    builder.addCase(fetchAsyncUpdateUserGroup.fulfilled, (state, action: PayloadAction<USER_GROUP[]>) => {
      state.status = 'succeeded';
      state.userGroups = action.payload;
      state.message = 'ユーザーグループの更新に成功しました';
    });
    builder.addCase(fetchAsyncUpdateUserGroup.rejected, handleError);
    builder.addCase(fetchAsyncUpdateUserGroup.pending, handleLoading);
    builder.addCase(fetchAsyncDeleteUserGroup.fulfilled, (state, action: PayloadAction<USER_GROUP[]>) => {
      state.status = 'succeeded';
      state.userGroups = action.payload;
      state.message = 'ユーザーグループの削除に成功しました';
      router.push("/");
    });
    builder.addCase(fetchAsyncDeleteUserGroup.rejected, handleError);
    builder.addCase(fetchAsyncDeleteUserGroup.pending, handleLoading);
  }
});

export const selectUserGroup = (state: RootState) => state.userGroup.userGroups;
export const selectUserGroupStatus    = (state: RootState) => state.userGroup.status;
export const selectUserGroupMessage   = (state: RootState) => state.userGroup.message;

export default userGroupSlice.reducer;
