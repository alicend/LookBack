import React, { FC, useState } from 'react';
import { useDispatch } from "react-redux";
import { Button, Grid, TextField } from "@mui/material";
import { styled } from '@mui/system';
import SaveIcon from "@mui/icons-material/Save";
import { z } from 'zod';
import { AppDispatch } from '@/store/store';
import { fetchAsyncUpdateLoginUserEmail } from '@/slices/userSlice';

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
  loginUserEmail: string;
}  

const Email: FC<Props> = React.memo(({ loginUserEmail }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newEmail, setNewEmail] = useState("");
  const [errors, setErrors] = useState({ new_email: "" });

  const isDisabled = newEmail.length === 0;
  
  const credentialSchema = z.object({
    new_email: z.string()
  }).superRefine((data, context) => {
    if (data.new_email === loginUserEmail) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['new_email'],
        message: "新しいメールアドレスは現在のメールアドレスと異なるものにしてください",
      });
    }
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(event.target.value);
    setErrors({ new_email: "" });
  };

  const update = async () => {
    const result = credentialSchema.safeParse({ new_email: newEmail });
    if (!result.success) {
      const newEmailError = result.error.formErrors.fieldErrors["new_email"]?.[0] || "";
      setErrors({ new_email: newEmailError });
      return;
    }
    await dispatch(fetchAsyncUpdateLoginUserEmail(newEmail));
  }
  
  return (
    <>
      <StyledTextField
        InputLabelProps={{ shrink: true }}
        label="Current Email"
        type="text"
        name="current_email"
        value={loginUserEmail}
        disabled={true}
      />
      <br />
      <StyledTextField
        InputLabelProps={{ shrink: true }}
        label="New Email"
        type="text"
        name="new_email"
        value={newEmail}
        onChange={handleInputChange}
        inputProps={{
          maxLength: 30
        }}
        error={Boolean(errors.new_email)}
        helperText={errors.new_email}
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

export default Email;