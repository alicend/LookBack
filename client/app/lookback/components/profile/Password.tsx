import React, { FC, useState } from 'react';
import { useDispatch } from "react-redux";
import { Button, Grid, TextField } from "@mui/material";
import { styled } from '@mui/system';
import SaveIcon from "@mui/icons-material/Save";
import { z } from 'zod';
import { AppDispatch } from '@/store/store';

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputLabel-root": {
    marginBottom: theme.spacing(1),
  },
  "& .MuiInput-root": {
    marginBottom: theme.spacing(2),
  },
  width: '300px',
}));

const UpdateButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#4dabf5 !important',
  '&:hover': {
    backgroundColor: '#1769aa !important',
  },
  '&:disabled': {
    backgroundColor: '#ccc !important',
    cursor: 'not-allowed'
  },
  margin: theme.spacing(2),
}));

const Password: FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const [credential, setCredential] = useState({ current_password: "", new_password: "" });
  const [errors, setErrors] = useState({ current_password: "", new_password: "" });

  const isDisabled = 
    credential.current_password.length === 0 ||
    credential.new_password.length === 0;

    // 少なくとも1つの英字と1つの数字を含む
  const passwordCheck = (val: string) => /[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/.test(val);
  
  const credentialSchema = z.object({
    current_password: z.string()
      .min(8, "パスワードは８文字以上にしてください")
      .refine(passwordCheck, "パスワードには少なくとも１つ以上の半角英字と半角数字を含めてください"),
    new_password: z.string()
      .min(8, "パスワードは８文字以上にしてください")
      .refine(passwordCheck, "パスワードには少なくとも１つ以上の半角英字と半角数字を含めてください"),
  }).superRefine((data, context) => {
    if (data.new_password === data.current_password) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['new_password'],
        message: "新しいパスワードは現在のパスワードと異なるものにしてください",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    setCredential({ ...credential, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const update = async () => {
    const result = credentialSchema.safeParse(credential);
    if (!result.success) {
      const currentPasswordError = result.error.formErrors.fieldErrors["current_password"]?.[0] || "";
      const newPasswordError = result.error.formErrors.fieldErrors["new_password"]?.[0] || "";
      setErrors({ 
        current_password: currentPasswordError,
        new_password: newPasswordError
      });
      return;
    }
    await dispatch(fetchAsyncUpdateLoginUserPassword(credential));
  }
  
  return (
    <>
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
      <Grid>
        <UpdateButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<SaveIcon />}
          disabled={isDisabled}
          onClick={update}
        >
          UPDATE
        </UpdateButton>
      </Grid>
    </>
  );
});

export default Password;
