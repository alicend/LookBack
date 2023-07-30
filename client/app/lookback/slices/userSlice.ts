import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { AUTHENTICATION } from "@/types/AuthType";
import { RootState } from "@/store/store";
import { USER } from "@/types/UserType";

export const fetchAsyncLogin = createAsyncThunk(
  "auth/login",
  async (auth: AUTHENTICATION, thunkAPI) => {
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
      return res.data.user;
    } catch (err :any) {
      return thunkAPI.rejectWithValue({
        response: err.response.data, 
        status: err.response.status
      });
    }
  }
);

export const fetchAsyncRegister = createAsyncThunk(
  "auth/register",
  async (auth: AUTHENTICATION, thunkAPI) => {
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
      return thunkAPI.rejectWithValue({
        response: err.response.data, 
        status: err.response.status
      });
    }
  }
);

const initialState: USER = {
  ID: 0,
  Name: ""
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser(state, action: PayloadAction<USER>) {
      state = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAsyncLogin.fulfilled, (state, action: PayloadAction<USER>) => {
      return {
        ...state,
        ID: action.payload.ID,
        Name: action.payload.Name,
      };
    });
  },
});

export const { loginUser } = userSlice.actions;
export const selectLoginUser = (state: RootState) => state.user;
export default userSlice.reducer;