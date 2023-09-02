import React, { useState } from "react";
import Link from '@mui/material/Link';
import { z } from 'zod';

import { styled } from '@mui/system';
import { TextField, Button, SelectChangeEvent, Fab } from "@mui/material";

import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchAsyncLogin, fetchAsyncRegisterRequest, fetchAsyncResetPasswordRequest } from "@/slices/userSlice";

import { Grid } from "@mui/material";

const Adjust = styled('div')`
  width: 1px;
  height: 90px;
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
const pattern = /^[\u0021-\u007e]+$/u; // 半角英数字記号のみ

const loginCredentialSchema = z.object({
  email: z.string()
  .email("無効なメールアドレスです")
  .regex(pattern, "無効なメールアドレスです"),
  password: z.string()
  .min(8, "パスワードは８文字以上にしてください")
  .refine(passwordCheck, "パスワードには少なくとも１つ以上の半角英字と半角数字を含めてください"),
});

const emailSchema = z.object({
  email: z.string()
    .email("無効なメールアドレスです")
    .regex(pattern, "無効なメールアドレスです"),
});

const Auth: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [loginViewValue, setLoginViewValue] = useState(0);
  const [credential, setCredential] = useState({ password: "", email: "" });
  const [errors, setErrors] = useState({ password: "", email: "" });

  const isDisabled = 
  (loginViewValue === 0 && (credential.email.length === 0 || credential.password.length === 0)) ||
  (loginViewValue === 1 && credential.email.length === 0) ||
  (loginViewValue === 2 && credential.email.length === 0);


  const handleLoginViewChange = (newValue: number) => {
    setLoginViewValue(newValue);
    setErrors({ password: "", email: "" }); // エラーメッセージをリセット
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    setCredential({ ...credential, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };
  
  const login = async () => {
    // 入力チェック
    const result = loginCredentialSchema.safeParse(credential);
    if (!result.success) {
      const emailError    = result.error.formErrors.fieldErrors["email"]?.[0] || "";
      const passwordError = result.error.formErrors.fieldErrors["password"]?.[0] || "";
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    // ログイン処理
    await dispatch(fetchAsyncLogin(credential));
  };

  const signUp = async () => {
    // 入力チェック
    const result = emailSchema.safeParse(credential);
    if (!result.success) {
      const emailError     = result.error.formErrors.fieldErrors["email"]?.[0] || "";
      setErrors({  password: "", email: emailError });
      return;
    }

    // 登録処理
    await dispatch(fetchAsyncRegisterRequest(credential.email));
  }

  const passwordReset = async () => {
    // 入力チェック
    const result = emailSchema.safeParse(credential);
    if (!result.success) {
      const emailError     = result.error.formErrors.fieldErrors["email"]?.[0] || "";
      setErrors({  password: "", email: emailError });
      return;
    }

    // 登録処理
    await dispatch(fetchAsyncResetPasswordRequest(credential.email));
  }

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: '80vh', padding: '12px' }}
      >
        <Grid item>
          <h1>
            {loginViewValue  === 0 && ("Login")}
            {loginViewValue  === 1 && ("Sign Up")}
            {loginViewValue  === 2 && ("Password Reset")}
          </h1>
        </Grid>
        <br />
        {(loginViewValue === 0 || loginViewValue === 1 || loginViewValue === 2) && (
          <Grid item>
            <StyledTextField
              InputLabelProps={{
                shrink: true,
              }}
              label="Email"
              type="email"
              name="email"
              value={credential.email}
              onChange={handleInputChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
          </Grid>
        )}

        {(loginViewValue === 0) && (
          <>
            <br />
            <Grid item>
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
            </Grid>
          </>
        )}

        <Grid item>
          <StyledButton
            variant="contained"
            color="primary"
            size="small"
            disabled={isDisabled}
            onClick={loginViewValue === 0 ? login : loginViewValue === 1 ? signUp : passwordReset}
          >
            {loginViewValue  === 0 && ("Login")}
            {loginViewValue  === 1 && ("Send Sign-up Email")}
            {loginViewValue  === 2 && ("Send Password-Reset Email")}
          </StyledButton>
        </Grid>

        <Grid item>
          {loginViewValue  === 0 && (
            <p>
              If you forgot your password
              <span> </span>
              <Link onClick={() => handleLoginViewChange(2)} className="cursor-pointer">
                click here
              </Link>
            </p>
          )}
          {loginViewValue  === 0 && (
            <p>
              Do you have an account ?
              <span> </span>
              <Link onClick={() => handleLoginViewChange(1)} className="cursor-pointer">
                Create account
              </Link>
            </p>
          )}
          {(loginViewValue === 1 || loginViewValue === 2) && (
            <p>
              <Link onClick={() => handleLoginViewChange(0)} className="cursor-pointer">
                Back to Login
              </Link>
            </p>
          )}        
          
        </Grid>

        {(loginViewValue === 1 || loginViewValue === 2) && (
          <Grid item>
            <Adjust/>
          </Grid>
        )}

      </Grid>

    </>
  );
};

export default Auth;