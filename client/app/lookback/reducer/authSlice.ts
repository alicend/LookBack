import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store/store";
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
    console.log(auth);
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

export const fetchAsyncGetMyProf = createAsyncThunk(
  "auth/loginuser",
  async () => {
    const res = await axios.get<LOGIN_USER>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/loginuser`,
      {
        headers: {
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

export const fetchAsyncCreateProf = createAsyncThunk(
  "auth/createProfile",
  async () => {
    const res = await axios.post<PROFILE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/profile`,
      { img: null },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

export const fetchAsyncGetProfs = createAsyncThunk(
  "auth/getProfiles",
  async () => {
    const res = await axios.get<PROFILE[]>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/profile`,
      {
        headers: {
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

export const fetchAsyncUpdateProf = createAsyncThunk(
  "auth/updateProfile",
  async (profile: POST_PROFILE) => {
    const uploadData = new FormData();
    profile.img && uploadData.append("img", profile.img, profile.img.name);
    const res = await axios.put<PROFILE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/profile/${profile.id}`,
      uploadData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

const initialState: AUTH_STATE = {
  isLoginView: true,
  loginUser: {
    id: 0,
    username: "",
  },
  profiles: [{ id: 0, user_profile: 0, img: null }],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    toggleMode(state) {
      state.isLoginView = !state.isLoginView;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchAsyncLogin.fulfilled,
      (state, action: PayloadAction<{ data: JWT; status: number }>) => {
        if (action.payload.status === 200) {
          router.push("/main-page");
        }
      }
    );
    builder.addCase(
      fetchAsyncGetMyProf.fulfilled,
      (state, action: PayloadAction<LOGIN_USER>) => {
        return {
          ...state,
          loginUser: action.payload,
        };
      }
    );
    builder.addCase(
      fetchAsyncGetProfs.fulfilled,
      (state, action: PayloadAction<PROFILE[]>) => {
        return {
          ...state,
          profiles: action.payload,
        };
      }
    );
    builder.addCase(
      fetchAsyncUpdateProf.fulfilled,
      (state, action: PayloadAction<PROFILE>) => {
        return {
          ...state,
          profiles: state.profiles.map((prof) =>
            prof.id === action.payload.id ? action.payload : prof
          ),
        };
      }
    );
  },
});

export const { toggleMode } = authSlice.actions;

export const selectIsLoginView = (state: RootState) => state.auth.isLoginView;
export const selectLoginUser = (state: RootState) => state.auth.loginUser;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;