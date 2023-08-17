export interface USER {
  ID: number;
  Name: string;
  UserGroupID: number;
}
export interface PASSWORD_UPDATE {
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