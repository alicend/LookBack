import { READ_TASK } from "./TaskType";

export interface CATEGORY {
  ID: number;
  Category: string;
}
export interface CATEGORY_RESPONSE {
  category: CATEGORY;
  categories: CATEGORY[];
}
export interface DELETE_CATEGORY_RESPONSE {
  tasks: READ_TASK[];
  categories: CATEGORY[];
  CategoryID: number;
}

export interface UPDATE_CATEGORY_RESPONSE {
  tasks: READ_TASK[];
  categories: CATEGORY[];
}