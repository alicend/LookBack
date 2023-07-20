import { CATEGORY_RESPONSE, CATEGORY } from '@/types/CategoryType';
import { TASK_RESPONSE, POST_TASK, TASK_STATE, READ_TASK } from '@/types/TaskType';
import { USER_RESPONSE, USER } from '@/types/UserType';
import { RootState } from '../store/store';
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import router from 'next/router';

export const fetchAsyncGetTasks = createAsyncThunk("task/getTask", async () => {
  const res = await axios.get<TASK_RESPONSE>(
    `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.data.tasks;
});

export const fetchAsyncGetUsers = createAsyncThunk(
  "task/getUsers",
  async () => {
    const res = await axios.get<USER_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/users`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.users;
  }
);

export const fetchAsyncGetCategory = createAsyncThunk(
  "task/getCategory",
  async () => {
    const res = await axios.get<CATEGORY_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/category`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.categories;
  }
);

export const fetchAsyncCreateCategory = createAsyncThunk(
  "task/createCategory",
  async (item: string) => {
    const res = await axios.post<CATEGORY_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/category`,
      { category: item },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.category;
  }
);

export const fetchAsyncCreateTask = createAsyncThunk(
  "task/createTask",
  async (task: POST_TASK) => {
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
  }
);

export const fetchAsyncUpdateTask = createAsyncThunk(
  "task/updateTask",
  async (task: POST_TASK) => {
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
  }
);

export const fetchAsyncDeleteTask = createAsyncThunk(
  "task/deleteTask",
  async (id: number) => {
    const res = await axios.delete<TASK_RESPONSE>(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.tasks;
  }
);

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
    builder.addCase(
      fetchAsyncGetTasks.fulfilled,
      (state, action: PayloadAction<READ_TASK[]>) => {
        console.log("action.payload")
        console.log(action.payload)
        return {
          ...state,
          tasks: action.payload,
        };
      }
    );
    builder.addCase(fetchAsyncGetTasks.rejected, (state, action) => {
      if (action.error.code === '401') {
        router.push("/");
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
      if (action.error.code === '401') {
        router.push("/");
      }
    });
    builder.addCase(
      fetchAsyncGetCategory.fulfilled,
      (state, action: PayloadAction<CATEGORY[]>) => {
        return {
          ...state,
          category: action.payload,
        };
      }
    );
    builder.addCase(fetchAsyncGetCategory.rejected, (state, action) => {
      if (action.error.code === '401') {
        router.push("/");
      }
    });
    builder.addCase(
      fetchAsyncCreateCategory.fulfilled,
      (state, action: PayloadAction<CATEGORY>) => {
        let updatedCategory;
        if (state.category) {
          updatedCategory = [...state.category, action.payload];
        } else {
          updatedCategory = [action.payload];
        }
        return {
          ...state,
          category: updatedCategory.sort((a, b) => a.Category.localeCompare(b.Category)),
        };
      }
    );
    builder.addCase(fetchAsyncCreateCategory.rejected, (state, action) => {
      if (action.error.code === '401') {
        router.push("/");
      }
    });
    builder.addCase(
      fetchAsyncCreateTask.fulfilled,
      (state, action: PayloadAction<READ_TASK[]>) => {
        return {
          ...state,
          tasks: action.payload,
          editedTask: initialState.editedTask,
        };
      }
    );
    builder.addCase(fetchAsyncCreateTask.rejected, (state, action) => {
      if (action.error.code === '401') {
        router.push("/");
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
      if (action.error.code === '401') {
        router.push("/");
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
      if (action.error.code === '401') {
        router.push("/");
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