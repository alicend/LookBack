import React, { useEffect, useState } from "react";
import { z } from 'zod';

import { styled } from '@mui/system';
import { TextField, Button, Snackbar, Alert, InputLabel, Select, FormControl, MenuItem, SelectChangeEvent, Fab } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchAsyncLogin, fetchAsyncRegister, selectMessage, selectStatus } from "@/slices/userSlice";
import NewCategoryModal from "./task/categoryModal/NewCategoryModal";
import { selectUserGroup } from "@/slices/userGroupSlice";

import { Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

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

const StyledFlexContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const StyledAddIcon = styled(AddIcon)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%) !important',
});

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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(2),
  minWidth: 240,
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  backgroundColor: '#4dabf5 !important',
  '&:hover': {
    backgroundColor: '#1769aa !important',
  },
  '&:disabled': {
    backgroundColor: '#ccc !important',
    cursor: 'not-allowed'
  },
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
  const dispatch: AppDispatch = useDispatch();
  const userGroups = useSelector(selectUserGroup);
  const status = useSelector(selectStatus);
  const message = useSelector(selectMessage);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [credential, setCredential] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: "", password: "" });

  const isDisabled =
  credential.username.length === 0 ||
  credential.password.length === 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    setCredential({ ...credential, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
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
    await dispatch(fetchAsyncLogin(credential));
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
    await dispatch(fetchAsyncRegister(credential));
  }

  useEffect(() => {
    if (status === 'succeeded' || status === 'failed') {
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    } else if (status === 'loading') {
      setSnackbarOpen(false);
    }
  }, [status]);

  let userGroupOptions = [{ ID: 0, UserGroup: '' }, ...userGroups].map((userGroup) => (
    <MenuItem key={userGroup.ID} value={userGroup.ID} style={{ minHeight: '36px'}}>
      {userGroup.UserGroup}
    </MenuItem>
  ));

  return (
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
        <Grid container item alignItems="center" justifyContent="center" style={{ marginTop: '16px' }}>
          <Grid>
            <StyledFormControl>
              <InputLabel>User Group</InputLabel>
              <Select
                name="UserGroup"
                // value={editedTask.Category}
                // onChange={handleSelectChange}
              >
                {userGroupOptions}
              </Select>
            </StyledFormControl>
          </Grid>

          <Grid>
            <StyledFab
              size="small"
              color="primary"
              // onClick={ handleNewCategoryOpen }
            >
              <StyledAddIcon />
            </StyledFab>
          </Grid>
        </Grid>
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

      <Grid item>
        <Snackbar open={snackbarOpen} autoHideDuration={6000}>
          <Alert onClose={handleSnackbarClose} severity={status === 'failed' ? 'error' : 'success'}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>
  );
};

export default Auth;