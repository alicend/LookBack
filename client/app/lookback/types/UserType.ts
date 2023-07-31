export interface USER {
  ID: number;
  Name: string;
}
export interface USER_RESPONSE {
  users: USER[];
}

export interface USER_STATE {
  status: "" | 'loading' | 'succeeded' | 'failed';
  loginUser: USER;
};