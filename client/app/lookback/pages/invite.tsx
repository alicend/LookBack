import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import { Button, Grid, TextField, styled } from "@mui/material";
import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import Cookies from "universal-cookie";
import { z } from "zod";
import { AppDispatch } from "../store/store";

import { MainPageLayout } from "@/components/layout/MainPageLayout";
import {
  fetchAsyncGetLoginUser,
  fetchAsyncInviteRequest,
  selectLoginUser,
} from "@/slices/userSlice";

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputLabel-root": {
    marginBottom: theme.spacing(1),
  },
  "& .MuiInput-root": {
    marginBottom: theme.spacing(2),
  },
  width: "300px",
}));

const UpdateButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#4dabf5 !important",
  "&:hover": {
    backgroundColor: "#1769aa !important",
  },
  "&:disabled": {
    backgroundColor: "#ccc !important",
    cursor: "not-allowed",
  },
  margin: theme.spacing(2),
}));

export default function Profile() {
  const dispatch: AppDispatch = useDispatch();
  const loginUser = useSelector(selectLoginUser);
  const [isGuestLogin, setGuestLogin] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [errors, setErrors] = useState({ invite_email: "" });

  const isDisabled = inviteEmail.length === 0;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInviteEmail(event.target.value);
    setErrors({ invite_email: "" });
  };

  const pattern = /^[\u0021-\u007e]+$/u; // 半角英数字記号のみ
  const credentialSchema = z.object({
    invite_email: z
      .string()
      .email("無効なメールアドレスです")
      .regex(pattern, "無効なメールアドレスです"),
  });

  const invite = async () => {
    const result = credentialSchema.safeParse({ invite_email: inviteEmail });
    if (!result.success) {
      const inviteEmailError =
        result.error.formErrors.fieldErrors["invite_email"]?.[0] || "";
      setErrors({ invite_email: inviteEmailError });
      return;
    }
    await dispatch(
      fetchAsyncInviteRequest({
        email: inviteEmail,
        userGroupID: loginUser.UserGroupID,
      }),
    );
  };

  useEffect(() => {
    const fetchBootLoader = async () => {
      await dispatch(fetchAsyncGetLoginUser());
    };
    fetchBootLoader();
  }, [dispatch]);

  useEffect(() => {
    const cookies = new Cookies();
    setGuestLogin(cookies.get("guest_login"));
  }, []);

  return (
    <MainPageLayout title="Invite">
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: "80vh" }}
      >
        {isGuestLogin && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded"
            role="alert"
          >
            <p>You cannot Invite to User Group while logged in as a guest.</p>
          </div>
        )}
        <Grid container justifyContent="center" mb={3}>
          <h1>Invite to User Group</h1>
        </Grid>

        <StyledTextField
          InputLabelProps={{ shrink: true }}
          label="Invite Email"
          type="text"
          name="invite_email"
          value={inviteEmail}
          disabled={isGuestLogin}
          onChange={handleInputChange}
          error={Boolean(errors.invite_email)}
          helperText={errors.invite_email}
          inputProps={{
            maxLength: 30,
          }}
        />
        <Grid>
          <UpdateButton
            variant="contained"
            color="primary"
            size="small"
            startIcon={<EmailRoundedIcon />}
            disabled={isDisabled}
            onClick={invite}
          >
            SEND INVITE MAIL
          </UpdateButton>
        </Grid>
      </Grid>
    </MainPageLayout>
  );
}
