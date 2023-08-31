import React, { useState } from "react";
import { z } from 'zod';

import { styled } from '@mui/system';
import { TextField, Button, SelectChangeEvent, Fab } from "@mui/material";

import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchAsyncLogin, fetchAsyncRegisterRequest } from "@/slices/userSlice";

import { Grid } from "@mui/material";

const Adjust = styled('div')`
  width: 1px;
  height: 88px;
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

const registerCredentialSchema = z.object({
  email: z.string()
    .email("無効なメールアドレスです")
    .regex(pattern, "無効なメールアドレスです"),
});

const loginCredentialSchema = z.object({
  email: z.string()
    .email("無効なメールアドレスです")
    .regex(pattern, "無効なメールアドレスです"),
  password: z.string()
    .min(8, "パスワードは８文字以上にしてください")
    .refine(passwordCheck, "パスワードには少なくとも１つ以上の半角英字と半角数字を含めてください"),
});

const Auth: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [isLoginView, setIsLoginView] = useState(true);
  const [credential, setCredential] = useState({ password: "", email: "" });
  const [errors, setErrors] = useState({ password: "", email: "" });

  const isDisabled = isLoginView
  ? (credential.email.length === 0 || credential.password.length === 0)
  : (credential.email.length === 0);

  const toggleLoginView = () => {
    setIsLoginView(!isLoginView);
    setErrors({ password: "", email: "" });
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

  const register = async () => {
    // 入力チェック
    const result = registerCredentialSchema.safeParse(credential);
    if (!result.success) {
      const emailError     = result.error.formErrors.fieldErrors["email"]?.[0] || "";
      setErrors({  password: "", email: emailError });
      return;
    }

    // 登録処理
    await dispatch(fetchAsyncRegisterRequest(credential.email));
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
          <h1>{isLoginView ? "Login" : "Register"}</h1>
        </Grid>
        <br />
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
        

        {isLoginView && 
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
        }

        <Grid item>
          <StyledButton
            variant="contained"
            color="primary"
            size="small"
            disabled={isDisabled}
            onClick={isLoginView ? login : register}
          >
            {isLoginView ? "Login" : "Send Sign-up Email"}
          </StyledButton>
        </Grid>

        <Grid item>
          <span onClick={() => toggleLoginView()} className="cursor-pointer">
            {isLoginView ? "Create new account ?" : "Back to Login"}
          </span>
        </Grid>

        {!isLoginView && 
          <Grid item>
            <Adjust/>
          </Grid>
        }

      </Grid>

    </>
  );
};

export default Auth;