import React, { useState } from "react";
import { z } from 'zod';

import { styled } from '@mui/system';
import { TextField, Button, SelectChangeEvent, Fab } from "@mui/material";

import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchAsyncLogin, fetchAsyncRegister } from "@/slices/userSlice";

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

const registerCredentialSchema = z.object({
  username: z.string(),
  password: z.string()
    .min(8, "パスワードは８文字以上にしてください")
    .refine(passwordCheck, "パスワードには少なくとも１つ以上の半角英字と半角数字を含めてください"),
  user_group: z.number().positive("ユーザーグループを選択してください").int("user_groupは整数でなければなりません")
});

const loginCredentialSchema = z.object({
  username: z.string(),
  password: z.string()
    .min(8, "パスワードは８文字以上にしてください")
    .refine(passwordCheck, "パスワードには少なくとも１つ以上の半角英字と半角数字を含めてください"),
});

const Auth: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [isLoginView, setIsLoginView] = useState(true);
  const [credential, setCredential] = useState({ username: "", password: "", user_group: ""});
  const [errors, setErrors] = useState({ username: "", password: "", user_group: "" });

  const isDisabled = isLoginView
  ? (credential.username.length === 0 || credential.password.length === 0)
  : (credential.username.length === 0 || credential.password.length === 0 || credential.user_group.length === 0);

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
      const usernameError = result.error.formErrors.fieldErrors["username"]?.[0] || "";
      const passwordError = result.error.formErrors.fieldErrors["password"]?.[0] || "";
      setErrors({ username: usernameError, password: passwordError, user_group: "" });
      return;
    }

    // ログイン処理
    await dispatch(fetchAsyncLogin(credential));
  };

  const register = async () => {
    // 入力チェック
    const result = registerCredentialSchema.safeParse(credential);
    if (!result.success) {
      const usernameError = result.error.formErrors.fieldErrors["username"]?.[0] || "";
      const passwordError = result.error.formErrors.fieldErrors["password"]?.[0] || "";
      const userGroupError = result.error.formErrors.fieldErrors["user_group"]?.[0] || "";
      setErrors({ username: usernameError, password: passwordError, user_group: userGroupError });
      return;
    }

    // 登録処理
    await dispatch(fetchAsyncRegister(credential));
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
            label="Username"
            type="text"
            name="username"
            value={credential.username}
            onChange={handleInputChange}
            error={Boolean(errors.username)}
            helperText={errors.username}
            inputProps={{
              maxLength: 30
            }}
          />
        </Grid>
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

        {!isLoginView && 
          <>
            <br />
            <Grid item>
              <StyledTextField
                InputLabelProps={{
                  shrink: true,
                }}
                label="User Group"
                type="text"
                name="user_group"
                value={credential.user_group}
                onChange={handleInputChange}
                error={Boolean(errors.user_group)}
                helperText={errors.user_group}
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
            {isLoginView ? "Login" : "Register"}
          </StyledButton>
        </Grid>

        <Grid item>
          <span onClick={() => setIsLoginView(!isLoginView)} className="cursor-pointer">
            {isLoginView ? "Create new account ?" : "Back to Login"}
          </span>
        </Grid>

        {isLoginView && 
          <Grid item>
            <Adjust/>
          </Grid>
        }

      </Grid>

    </>
  );
};

export default Auth;