import React, { useState } from "react";
import { z } from 'zod';

import { styled } from '@mui/system';
import { TextField, Button } from "@mui/material";

import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import {  fetchAsyncResetPassword } from "@/slices/userSlice";

import { Grid } from "@mui/material";

const Adjust = styled('div')`
  width: 1px;
  height: 73px;
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
const passwordSchema = z.object({
  password: z.string()
    .min(8, "パスワードは８文字以上にしてください")
    .refine(passwordCheck, "パスワードには少なくとも１つ以上の半角英字と半角数字を含めてください"),
});

interface Props {
  email: string;
}  

const PasswordReset: React.FC<Props> = React.memo(({ email }) => {
  const dispatch: AppDispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ password: "" });

  const isDisabled = password.length === 0

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value );
    setErrors({ ...errors, password: "" });
  };

  const passwordReset = async () => {
    // 入力チェック
    const result = passwordSchema.safeParse({password});
    if (!result.success) {
      const passwordError = result.error.formErrors.fieldErrors["password"]?.[0] || "";
      setErrors({ password: passwordError });
      return;
    }

    // パスワードリセット処理
    await dispatch(fetchAsyncResetPassword({email: email, password: password}));
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
          <h1>Password Reset{email}</h1>
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
            value={password}
            onChange={handleInputChange}
            error={Boolean(errors.password)}
            helperText={errors.password}
          />
        </Grid>


        <Grid item>
          <StyledButton
            variant="contained"
            color="primary"
            size="small"
            disabled={isDisabled}
            onClick={passwordReset}
          >
            Password Reset
          </StyledButton>
        </Grid>

        <Grid item>
          <Adjust/>
        </Grid>

      </Grid>

    </>
  );
});

export default PasswordReset;