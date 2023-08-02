export interface USER {
  ID: number;
  Name: string;
}
export interface USER_UPDATE {
  new_username: string;
  current_password: string;
  new_password: string;
}
export interface USER_RESPONSE {
  users: USER[];
}
export interface USER_STATE {
  status: "" | 'loading' | 'succeeded' | 'failed';
  message: string;
  loginUser: USER;
};