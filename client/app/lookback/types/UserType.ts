export interface USER {
  ID: number;
  Email: string;
  Name: string;
  UserGroupID: number;
  UserGroup: string;
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

export interface PASSWORD_RESET {
  email: string;
  password: string;
}