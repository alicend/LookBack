export interface RESPONSE {
  error: string;
  message?: string;
}

export interface PAYLOAD {
  response: RESPONSE;
  status: number;
}

export interface AsyncActionErrorPayload {
  error: string;
  status: number;
  response: {
    message: string;
    error: string;
  };
}
