import React, { FC, useState } from 'react';
import { useDispatch } from "react-redux";
import { Button, Grid, TextField } from "@mui/material";
import { styled } from '@mui/system';
import SaveIcon from "@mui/icons-material/Save";
import { z } from 'zod';
import { AppDispatch } from '@/store/store';
import { fetchAsyncUpdateLoginUsername } from '@/slices/userSlice';

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

interface Props {
  loginUserName: string;
  loginStatus: boolean;
}  

const UserName: FC<Props> = React.memo(({ loginUserName, loginStatus }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newUsername, setNewUsername] = useState("");
  const [errors, setErrors] = useState({ new_username: "" });

  const isDisabled = newUsername.length === 0;
  
  const credentialSchema = z.object({
    new_username: z.string()
  }).superRefine((data, context) => {
    if (data.new_username === loginUserName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['new_username'],
        message: "新しいユーザー名は現在のユーザー名と異なるものにしてください",
      });
    }
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(event.target.value);
    setErrors({ new_username: "" });
  };

  const update = async () => {
    const result = credentialSchema.safeParse({ new_username: newUsername });
    if (!result.success) {
      const newUsernameError = result.error.formErrors.fieldErrors["new_username"]?.[0] || "";
      setErrors({ new_username: newUsernameError });
      return;
    }
    await dispatch(fetchAsyncUpdateLoginUsername(newUsername));
  }
  
  return (
    <>
      <StyledTextField
        InputLabelProps={{ shrink: true }}
        label="Current Username"
        type="text"
        name="current_username"
        value={loginUserName}
        disabled={true}
      />
      <br />
      <StyledTextField
        InputLabelProps={{ shrink: true }}
        label="New Username"
        type="text"
        name="new_username"
        value={newUsername}
        disabled={loginStatus}
        onChange={handleInputChange}
        inputProps={{
          maxLength: 30
        }}
        error={Boolean(errors.new_username)}
        helperText={errors.new_username}
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

export default UserName;
