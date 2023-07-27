import { CATEGORY_RESPONSE, CATEGORY, DELETE_CATEGORY_RESPONSE } from '@/types/CategoryType';
import { TASK_RESPONSE, POST_TASK, TASK_STATE, READ_TASK } from '@/types/TaskType';
import { USER_RESPONSE, USER } from '@/types/UserType';
import { RootState } from '../store/store';
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import router from 'next/router';
import { PAYLOAD, RESPONSE } from '@/types/ResponseType';

export const fetchAsyncGetTasks = createAsyncThunk("task/getTask", async (_, thunkAPI) => {
  try {
    const res = await axios.get<TASK_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.tasks;
  } catch (err :any) {
    return thunkAPI.rejectWithValue({
      response: err.response.data, 
      status: err.response.status
    });
  }
});

export const fetchAsyncGetUsers = createAsyncThunk("task/getUsers", async (_, thunkAPI) => {
  try{
    const res = await axios.get<USER_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/users`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.users;
  } catch (err :any) {
    return thunkAPI.rejectWithValue({
      response: err.response.data, 
      status: err.response.status
    });
  }
});

export const fetchAsyncGetCategory = createAsyncThunk("task/getCategory", async (_, thunkAPI) => {
  try{
    const res = await axios.get<CATEGORY_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/category`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.categories;
  } catch (err :any) {
    return thunkAPI.rejectWithValue({
      response: err.response.data, 
      status: err.response.status
    });
  }
});

export const fetchAsyncCreateCategory = createAsyncThunk("task/createCategory", async (category: string, thunkAPI) => {
  try{
    const res = await axios.post<CATEGORY_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/category`,
      { category: category },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.categories;
  } catch (err :any) {
    return thunkAPI.rejectWithValue({
      response: err.response.data, 
      status: err.response.status
    });
  }
});

export const fetchAsyncUpdateCategory = createAsyncThunk("task/updateCategory", async (category: CATEGORY, thunkAPI) => {
  try{
    console.log(category);
    const res = await axios.put<CATEGORY_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/category/${category.ID}`,
      { category: category.Category },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.categories;
  } catch (err :any) {
    return thunkAPI.rejectWithValue({
      response: err.response.data, 
      status: err.response.status
    });
  }
});

export const fetchAsyncDeleteCategory = createAsyncThunk("task/deleteCategory", async (id: number, thunkAPI) => {
  try{
    const res = await axios.delete<DELETE_CATEGORY_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/category/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return {
      categories: res.data.categories,
      tasks:      res.data.tasks,
      CategoryID: id
    };
  } catch (err :any) {
    return thunkAPI.rejectWithValue({
      response: err.response.data, 
      status: err.response.status
    });
  }
});

export const fetchAsyncCreateTask = createAsyncThunk("task/createTask", async (task: POST_TASK, thunkAPI) => {
  try{
    const res = await axios.post<TASK_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks`,
      task,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.tasks;
  } catch (err :any) {
    return thunkAPI.rejectWithValue({
      response: err.response.data, 
      status: err.response.status
    });
  }
});

export const fetchAsyncUpdateTask = createAsyncThunk("task/updateTask", async (task: POST_TASK, thunkAPI) => {
  try{  
    const res = await axios.put<TASK_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks/${task.ID}`,
      task,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.tasks;
  } catch (err :any) {
    return thunkAPI.rejectWithValue({
      response: err.response.data, 
      status: err.response.status
    });
  }
});

export const fetchAsyncDeleteTask = createAsyncThunk("task/deleteTask", async (id: number, thunkAPI) => {
  try{ 
    const res = await axios.delete<TASK_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.tasks;
  } catch (err :any) {
    return thunkAPI.rejectWithValue({
      response: err.response.data, 
      status: err.response.status
    });
  }
});

export const initialState: TASK_STATE = {
  tasks: [
    {
      ID: 0,
      Task: "",
      Description: "",
      StartDate: "",
      Creator: 0,
      CreatorUserName: "",
      Responsible: 0,
      ResponsibleUserName: "",
      Estimate: 0,
      Category: 0,
      CategoryName: "",
      Status: 0,
      StatusName: "",
      CreatedAt: "",
      UpdatedAt: "",
    },
  ],
  editedTask: {
    ID: 0,
    Task: "",
    Description: "",
    StartDate: "",
    Responsible: 0,
    Estimate: 0,
    Category: 0,
    Status: 0,
  },
  selectedTask: {
    ID: 0,
    Task: "",
    Description: "",
    StartDate: "",
    Creator: 0,
    CreatorUserName: "",
    Responsible: 0,
    ResponsibleUserName: "",
    Estimate: 0,
    Category: 0,
    CategoryName: "",
    Status: 0,
    StatusName: "",
    CreatedAt: "",
    UpdatedAt: "",
  },
  users: [
    {
      ID: 0,
      Name: "",
    },
  ],
  category: [
    {
      ID: 0,
      Category: "",
    },
  ],
};

export const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    editTask(state, action: PayloadAction<POST_TASK>) {
      state.editedTask = action.payload;
    },
    selectTask(state, action: PayloadAction<READ_TASK>) {
      state.selectedTask = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAsyncGetTasks.fulfilled, (state, action: PayloadAction<READ_TASK[]>) => {
        return {
          ...state,
          tasks: action.payload,
        };
      }
    );
    builder.addCase(fetchAsyncGetTasks.rejected, (state, action) => {
      const payload = action.payload as PAYLOAD;
      if (payload.status === 401) {
        alert("認証エラー")
        router.push("/");
      } else {
        // payloadにmessageが存在すればそれを使用し、存在しなければerrorを使用
        const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
        alert(errorMessage);
      }
    });
    builder.addCase(
      fetchAsyncGetUsers.fulfilled,
      (state, action: PayloadAction<USER[]>) => {
        return {
          ...state,
          users: action.payload,
        };
      }
    );
    builder.addCase(fetchAsyncGetUsers.rejected, (state, action) => {
      const payload = action.payload as PAYLOAD;
      if (payload.status === 401) {
        alert("認証エラー")
        router.push("/");
      } else {
        // payloadにmessageが存在すればそれを使用し、存在しなければerrorを使用
        const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
        alert(errorMessage);
      }
    });
    builder.addCase(fetchAsyncGetCategory.fulfilled, (state, action: PayloadAction<CATEGORY[]>) => {
      return {
        ...state,
        category: action.payload,
      };
    });
    builder.addCase(fetchAsyncGetCategory.rejected, (state, action) => {
      const payload = action.payload as PAYLOAD;
      if (payload.status === 401) {
        alert("認証エラー")
        router.push("/");
      } else {
        // payloadにmessageが存在すればそれを使用し、存在しなければerrorを使用
        const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
        alert(errorMessage);
      }
    });
    builder.addCase(fetchAsyncCreateCategory.fulfilled, (state, action: PayloadAction<CATEGORY[]>) => {
      return {
        ...state,
        category: action.payload,
      };
    });
    builder.addCase(fetchAsyncCreateCategory.rejected, (state, action) => {
      const payload = action.payload as PAYLOAD;
      if (payload.status === 401) {
        alert("認証エラー")
        router.push("/");
      } else {
        // payloadにmessageが存在すればそれを使用し、存在しなければerrorを使用
        const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
        alert(errorMessage);
      }
    });
    builder.addCase(fetchAsyncUpdateCategory.fulfilled, (state, action: PayloadAction<CATEGORY[]>) => {
      return {
        ...state,
        category: action.payload,
      };
    });
    builder.addCase(fetchAsyncUpdateCategory.rejected, (state, action) => {
      const payload = action.payload as PAYLOAD;
      if (payload.status === 401) {
        alert("認証エラー")
        router.push("/");
      } else {
        // payloadにmessageが存在すればそれを使用し、存在しなければerrorを使用
        const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
        alert(errorMessage);
      }
    });
    builder.addCase(fetchAsyncDeleteCategory.fulfilled, (state, action: PayloadAction<DELETE_CATEGORY_RESPONSE>) => {
      return {
        ...state,
        editedTask: {
          ...state.editedTask,
          Category: state.editedTask.Category === action.payload.CategoryID ? 0 : state.editedTask.Category,
        },
        category: action.payload.categories,
        tasks: action.payload.tasks, 
      };
    });
    builder.addCase(fetchAsyncDeleteCategory.rejected, (state, action) => {
      const payload = action.payload as PAYLOAD;
      if (payload.status === 401) {
        alert("認証エラー")
        router.push("/");
      } else {
        // payloadにmessageが存在すればそれを使用し、存在しなければerrorを使用
        const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
        alert(errorMessage);
      }
    });
    builder.addCase(fetchAsyncCreateTask.fulfilled, (state, action: PayloadAction<READ_TASK[]>) => {
      return {
        ...state,
        tasks: action.payload,
        editedTask: initialState.editedTask,
      };
    });
    builder.addCase(fetchAsyncCreateTask.rejected, (state, action) => {
      console.log(action)
      const payload = action.payload as PAYLOAD;
      if (payload.status === 401) {
        alert("認証エラー")
        router.push("/");
      } else {
        // payloadにmessageが存在すればそれを使用し、存在しなければerrorを使用
        console.log(payload)
        const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
        alert(errorMessage);
      }
    });
    builder.addCase(
      fetchAsyncUpdateTask.fulfilled,
      (state, action: PayloadAction<READ_TASK[]>) => {
        return {
          ...state,
          tasks: action.payload,
          editedTask: initialState.editedTask,
          selectedTask: initialState.selectedTask,
        };
      }
    );
    builder.addCase(fetchAsyncUpdateTask.rejected, (state, action) => {
      const payload = action.payload as PAYLOAD;
      if (payload.status === 401) {
        alert("認証エラー")
        router.push("/");
      } else {
        // payloadにmessageが存在すればそれを使用し、存在しなければerrorを使用
        const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
        alert(errorMessage);
      }
    });
    builder.addCase(
      fetchAsyncDeleteTask.fulfilled,
      (state, action: PayloadAction<READ_TASK[]>) => {
        return {
          ...state,
          tasks: action.payload,
          editedTask: initialState.editedTask,
          selectedTask: initialState.selectedTask,
        };
      }
    );
    builder.addCase(fetchAsyncDeleteTask.rejected, (state, action) => {
      const payload = action.payload as PAYLOAD;
      if (payload.status === 401) {
        alert("認証エラー")
        router.push("/");
      } else {
        // payloadにmessageが存在すればそれを使用し、存在しなければerrorを使用
        const errorMessage = payload.response.message ? payload.response.message : payload.response.error;
        alert(errorMessage);
      }
    });
  },
});

export const { editTask, selectTask } = taskSlice.actions;
export const selectSelectedTask = (state: RootState) => state.task.selectedTask;
export const selectEditedTask   = (state: RootState) => state.task.editedTask;
export const selectTasks        = (state: RootState) => state.task.tasks;
export const selectUsers        = (state: RootState) => state.task.users;
export const selectCategory     = (state: RootState) => state.task.category;
export default taskSlice.reducer;