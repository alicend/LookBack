export interface EmailTokenPayload {
  email: string;
  exp: number;
}
export interface UserGroupIDTokenPayload {
  user_group_id: string;
  exp: number;
}