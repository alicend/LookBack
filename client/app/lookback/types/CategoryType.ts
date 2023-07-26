export interface CATEGORY {
  ID: number;
  Category: string;
}
export interface CATEGORY_RESPONSE {
  category: CATEGORY;
  categories: CATEGORY[];
}
export interface DELETE_CATEGORY_RESPONSE {
  CategoryID: number;
  message: string;
}