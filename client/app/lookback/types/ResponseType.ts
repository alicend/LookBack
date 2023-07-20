export interface RESPONSE {
  error: string,
  message?: string
}

export interface PAYLOAD {
  response: RESPONSE,
  status: number
}