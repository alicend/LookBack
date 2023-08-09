export interface USER_GROUP {
  ID: number;
  UserGroup: string;
}
export interface USER_GROUP_RESPONSE {
  users: USER_GROUP[];
}
export interface USER_GROUP_STATE {
  status: "" | 'loading' | 'succeeded' | 'failed';
  message: string;
  userGroups: USER_GROUP[];
};