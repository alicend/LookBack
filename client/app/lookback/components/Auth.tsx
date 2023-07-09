import React, { useState } from "react";
import { styled } from '@mui/system';
import { TextField, Button } from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import {
  toggleMode,
  fetchAsyncLogin,
  fetchAsyncRegister,
  fetchAsyncCreateProf,
  selectIsLoginView,
} from "@/reducer/authSlice";

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
  margin: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputLabel-root": {
    marginBottom: theme.spacing(1),
  },
  "& .MuiInput-root": {
    marginBottom: theme.spacing(2),
  },
}));

const Auth: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const isLoginView = useSelector(selectIsLoginView);
  const [credential, setCredential] = useState({ username: "", password: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    setCredential({ ...credential, [name]: value });
  };
  const login = async () => {
    if (isLoginView) {
      await dispatch(fetchAsyncLogin(credential));
    } else {
      const result = await dispatch(fetchAsyncRegister(credential));
      console.log(result);
      if (fetchAsyncRegister.fulfilled.match(result)) {
        await dispatch(fetchAsyncLogin(credential));
        //await dispatch(fetchAsyncCreateProf());
      }
    }
  };

  return (
    <StyledContainer>
      <h1>{isLoginView ? "Login" : "Register"}</h1>
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
      />
      <StyledButton
        variant="contained"
        color="primary"
        size="small"
        onClick={login}
      >
        {isLoginView ? "Login" : "Register"}
      </StyledButton>
      <span onClick={() => dispatch(toggleMode())} className="cursor-pointer">
        {isLoginView ? "Create new account ?" : "Back to Login"}
      </span>
    </StyledContainer>
  );
};

export default Auth;