import { RootState } from '../store/store';
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { READ_TASK, POST_TASK, TASK_STATE, USER, CATEGORY, CATEGORY_RESPONSE, USER_RESPONSE, TASK_RESPONSE } from "@/types/type";
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
    return res.data.task;
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
    return res.data.task;
  }
);

export const fetchAsyncDeleteTask = createAsyncThunk(
  "task/deleteTask",
  async (id: number) => {
    await axios.delete(`${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks/${id}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return id;
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
      Creator_UserName: "",
      Responsible: 0,
      Responsible_UserName: "",
      Estimate: 0,
      CategoryID: 0,
      CategoryName: "",
      Status: "",
      StatusName: "",
      created_at: "",
      updated_at: "",
    },
  ],
  editedTask: {
    ID: 0,
    Task: "",
    Description: "",
    StartDate: "",
    Responsible: 0,
    Estimate: 0,
    CategoryID: 0,
    Status: "",
  },
  selectedTask: {
    ID: 0,
    Task: "",
    Description: "",
    StartDate: "",
    Creator: 0,
    Creator_UserName: "",
    Responsible: 0,
    Responsible_UserName: "",
    Estimate: 0,
    CategoryID: 0,
    CategoryName: "",
    Status: "",
    StatusName: "",
    created_at: "",
    updated_at: "",
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
        return {
          ...state,
          tasks: action.payload,
        };
      }
    );
    builder.addCase(fetchAsyncGetTasks.rejected, () => {
      router.push("/");
    });
    builder.addCase(
      fetchAsyncGetUsers.fulfilled,
      (state, action: PayloadAction<USER[]>) => {
        console.log(action.payload)
        return {
          ...state,
          users: action.payload,
        };
      }
    );
    builder.addCase(
      fetchAsyncGetCategory.fulfilled,
      (state, action: PayloadAction<CATEGORY[]>) => {
        console.log(action.payload)
        return {
          ...state,
          category: action.payload,
        };
      }
    );
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
    builder.addCase(fetchAsyncCreateCategory.rejected, () => {
      //router.push("/");
    });
    builder.addCase(
      fetchAsyncCreateTask.fulfilled,
      (state, action: PayloadAction<READ_TASK>) => {
        console.log("stateだよ")
        console.log(state)
        console.log("actionだよ")
        console.log(action)
        return {
          ...state,
          tasks: [action.payload, ...state.tasks],
          editedTask: initialState.editedTask,
        };
      }
    );
    builder.addCase(fetchAsyncCreateTask.rejected, () => {
      //router.push("/");
    });
    builder.addCase(
      fetchAsyncUpdateTask.fulfilled,
      (state, action: PayloadAction<READ_TASK>) => {
        return {
          ...state,
          tasks: state.tasks.map((t) =>
            t.ID === action.payload.ID ? action.payload : t
          ),
          editedTask: initialState.editedTask,
          selectedTask: initialState.selectedTask,
        };
      }
    );
    builder.addCase(fetchAsyncUpdateTask.rejected, () => {
      router.push("/");
    });
    builder.addCase(
      fetchAsyncDeleteTask.fulfilled,
      (state, action: PayloadAction<number>) => {
        return {
          ...state,
          tasks: state.tasks.filter((t) => t.ID !== action.payload),
          editedTask: initialState.editedTask,
          selectedTask: initialState.selectedTask,
        };
      }
    );
    builder.addCase(fetchAsyncDeleteTask.rejected, () => {
      router.push("/");
    });
  },
});

export const { editTask, selectTask } = taskSlice.actions;
export const selectSelectedTask = (state: RootState) => state.task.selectedTask;
export const selectEditedTask = (state: RootState) => state.task.editedTask;
export const selectTasks = (state: RootState) => state.task.tasks;
export const selectUsers = (state: RootState) => state.task.users;
export const selectCategory = (state: RootState) => state.task.category;
export default taskSlice.reducer;