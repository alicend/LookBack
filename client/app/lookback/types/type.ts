/*authSlice.ts*/
export interface LOGIN_USER {
  id: number;
  username: string;
}
export interface FILE extends Blob {
  readonly lastModified: number;
  readonly name: string;
}
export interface PROFILE {
  id: number;
  user_profile: number;
  img: string | null;
}
export interface POST_PROFILE {
  id: number;
  img: File | null;
}
export interface CRED {
  username: string;
  password: string;
}
export interface JWT {
  refresh: string;
  access: string;
}
export interface USER {
  ID: number;
  Name: string;
}
export interface USER_RESPONSE {
  users: USER[];
}
export interface AUTH_STATE {
  isLoginView: boolean;
  loginUser: LOGIN_USER;
  profiles: PROFILE[];
}
/*taskSlice.ts*/
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
  created_at: string;
  updated_at: string;
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
  task: READ_TASK;
  tasks: READ_TASK[];
}
export interface CATEGORY {
  ID: number;
  Category: string;
}
export interface CATEGORY_RESPONSE {
  category: CATEGORY;
  categories: CATEGORY[];
}
export interface TASK_STATE {
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