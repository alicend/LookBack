import React, { useState } from "react";
import { useRouter } from 'next/router';
import { z } from 'zod';

import { styled } from '@mui/system';
import { TextField, Button } from "@mui/material";

import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchAsyncLogin, fetchAsyncRegister } from "@/slices/userSlice";

import { RESPONSE } from "@/types/ResponseType";

const StyledContainer = styled('div')`
  font-family: serif;
  color: gray-500;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
`;

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#4dabf5 !important',
  '&:hover': {
    backgroundColor: '#1769aa !important',
  },
  '&:disabled': {
    backgroundColor: '#ccc !important',
    cursor: 'not-allowed'
  },
  margin: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputLabel-root": {
    marginBottom: theme.spacing(1),
  },
  "& .MuiInput-root": {
    marginBottom: theme.spacing(2),
  },
  width: '300px',
}));

// 少なくとも1つの英字と1つの数字を含む
const passwordCheck = (val: string) => /[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/.test(val);

const credentialSchema = z.object({
  username: z.string(),
  password: z.string()
    .min(8, "パスワードは８文字以上にしてください")
    .refine(passwordCheck, "パスワードには少なくとも１つ以上の半角英字と半角数字を含めてください"),
});

const Auth: React.FC = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const [isLoginView, setIsLoginView] = useState(true);
  const [credential, setCredential] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const isDisabled =
  credential.username.length === 0 ||
  credential.password.length === 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    setCredential({ ...credential, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };
  
  const login = async () => {
    // 入力チェック
    const result = credentialSchema.safeParse(credential);
    if (!result.success) {
      const usernameError = result.error.formErrors.fieldErrors["username"]?.[0] || "";
      const passwordError = result.error.formErrors.fieldErrors["password"]?.[0] || "";
      setErrors({ username: usernameError, password: passwordError });
      return;
    }

    // ログイン処理
    const loginResult = await dispatch(fetchAsyncLogin(credential));
    // レスポンスの結果に応じてエラーメッセージを設定
    if (fetchAsyncLogin.fulfilled.match(loginResult)) {
      router.push("/task-board");
    } else if (fetchAsyncLogin.rejected.match(loginResult)){
      const payload = loginResult.payload as RESPONSE;
      // payloadにmessageが存在すればそれを使用し、存在しなければerrorを使用
      const errorMessage = payload.message ? payload.message : payload.error;
      setLoginError(errorMessage);
    }
  };

  const register = async () => {
    // 入力チェック
    const result = credentialSchema.safeParse(credential);
    if (!result.success) {
      const usernameError = result.error.formErrors.fieldErrors["username"]?.[0] || "";
      const passwordError = result.error.formErrors.fieldErrors["password"]?.[0] || "";
      setErrors({ username: usernameError, password: passwordError });
      return;
    }

    // 登録処理
    const registerResult = await dispatch(fetchAsyncRegister(credential));
      if (fetchAsyncRegister.fulfilled.match(registerResult)) {
        login
      } else if (fetchAsyncRegister.rejected.match(registerResult)) {
        const payload = registerResult.payload as RESPONSE;
        // payloadにmessageが存在すればそれを使用し、存在しなければerrorを使用
        const errorMessage = payload.message ? payload.message : payload.error;
        setLoginError(errorMessage);
      }
  }

  return (
    <StyledContainer>
      <h1>{isLoginView ? "Login" : "Register"}</h1>
      {loginError && <div className="text-red-600">{loginError}</div>}
      <br />
      <StyledTextField
        InputLabelProps={{
          shrink: true,
        }}
        label="Username"
        type="text"
        name="username"
        value={credential.username}
        onChange={handleInputChange}
        error={Boolean(errors.username)}
        helperText={errors.username}
      />
      <br />
      <StyledTextField
        InputLabelProps={{
          shrink: true,
        }}
        label="Password"
        type="password"
        name="password"
        value={credential.password}
        onChange={handleInputChange}
        error={Boolean(errors.password)}
        helperText={errors.password}
      />
      <StyledButton
          variant="contained"
          color="primary"
          size="small"
          disabled={isDisabled}
          onClick={isLoginView ? login : register}
      >
          {isLoginView ? "Login" : "Register"}
      </StyledButton>
      <span onClick={() => setIsLoginView(!isLoginView)} className="cursor-pointer">
        {isLoginView ? "Create new account ?" : "Back to Login"}
      </span>
    </StyledContainer>
  );
};

export default Auth;