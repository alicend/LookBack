import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { z } from 'zod';

import { styled } from '@mui/system';
import { TextField, Button, Grid } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchAsyncGetLoginUser, fetchAsyncLogin, fetchAsyncRegister, selectLoginUser } from "@/slices/userSlice";

import { MainPageLayout } from "@/components/layout/MainPageLayout";

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
  new_username: z.string(),
  current_password: z.string()
    .min(8, "パスワードは８文字以上にしてください")
    .refine(passwordCheck, "パスワードには少なくとも１つ以上の半角英字と半角数字を含めてください"),
  new_password: z.string()
    .min(8, "パスワードは８文字以上にしてください")
    .refine(passwordCheck, "パスワードには少なくとも１つ以上の半角英字と半角数字を含めてください"),
});

const profile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const loginUser = useSelector(selectLoginUser);

  const [credential, setCredential] = useState({ new_username: "", current_password: "", new_password: "" });
  const [errors, setErrors] = useState({ new_username: "", current_password: "", new_password: "" });
  const [updateError, setUpdateError] = useState("");

  const isDisabled =
  credential.new_username.length === 0 ||
  credential.current_password.length === 0 ||
  credential.new_password.length === 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    setCredential({ ...credential, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const update = () => {
    const result = credentialSchema.safeParse(credential);
    if (!result.success) {
      const newUsernameError = result.error.formErrors.fieldErrors["new_username"]?.[0] || "";
      const currentPasswordError = result.error.formErrors.fieldErrors["current_password"]?.[0] || "";
      const newPasswordError = result.error.formErrors.fieldErrors["new_password"]?.[0] || "";
      setErrors({ 
        new_username: newUsernameError,
        current_password: currentPasswordError,
        new_password: newPasswordError
      });
      return;
    }

  }
  
  useEffect(() => {
    const fetchBootLoader = async () => {
      await dispatch(fetchAsyncGetLoginUser());
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <MainPageLayout title="Profile Edit">
      <Grid item xs={12}>
        <StyledContainer>
          {updateError && <div className="text-red-600">{updateError}</div>}
          <br />
          <StyledTextField
            InputLabelProps={{
              shrink: true,
            }}
            label="Current Username"
            type="text"
            name="current_username"
            value={loginUser?.Name}
            disabled={true}
          />
          <br />
          <StyledTextField
            InputLabelProps={{
              shrink: true,
            }}
            label="New Username"
            type="text"
            name="new_username"
            value={credential.new_username}
            onChange={handleInputChange}
            error={Boolean(errors.new_username)}
            helperText={errors.new_username}
          />
          <br />
          <br />
          <StyledTextField
            InputLabelProps={{
              shrink: true,
            }}
            label="Current Password"
            type="password"
            name="current_password"
            value={credential.current_password}
            onChange={handleInputChange}
            error={Boolean(errors.current_password)}
            helperText={errors.current_password}
          />
          <br />
          <StyledTextField
            InputLabelProps={{
              shrink: true,
            }}
            label="New Password"
            type="password"
            name="new_password"
            value={credential.new_password}
            onChange={handleInputChange}
            error={Boolean(errors.new_password)}
            helperText={errors.new_password}
          />
          <StyledButton
              variant="contained"
              color="primary"
              size="small"
              disabled={isDisabled}
              onClick={update}
          >
              UPDATE
          </StyledButton>
        </StyledContainer>
      </Grid>
    </MainPageLayout>
  );
};

export default profile;