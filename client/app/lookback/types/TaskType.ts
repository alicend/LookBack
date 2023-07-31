import { CATEGORY } from "./CategoryType";
import { USER } from "./UserType";

export interface READ_TASK {
  ID: number;
  Task: string;
  Description: string;
  StartDate: string;
  Status: number;
  StatusName: string;
  Category: number;
  CategoryName: string;
  Estimate: number;
  Responsible: number;
  ResponsibleUserName: string;
  Creator: number;
  CreatorUserName: string;
  CreatedAt: string;
  UpdatedAt: string;
}
export interface POST_TASK {
  ID: number;
  Task: string;
  Description: string;
  StartDate: string;
  Status: number;
  Category: number;
  Estimate: number;
  Responsible: number;
}
export interface TASK_RESPONSE {
  tasks: READ_TASK[];
}
export interface TASK_STATE {
  status: "" | 'loading' | 'succeeded' | 'failed';
  message: string;
  tasks: READ_TASK[];
  editedTask: POST_TASK;
  selectedTask: READ_TASK;
  users: USER[];
  category: CATEGORY[];
}
export interface SORT_STATE {
  rows: READ_TASK[];
  order: "desc" | "asc";
  activeKey: string;
}