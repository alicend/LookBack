import { selectTaskStatus, selectTaskMessage } from "@/slices/taskSlice";
import { selectUserGroupStatus, selectUserGroupMessage } from "@/slices/userGroupSlice";
import { selectUserStatus, selectUserMessage } from "@/slices/userSlice";
import { Snackbar, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const MessageBar: React.FC = () => {

  const taskStatus = useSelector(selectTaskStatus);
  const taskMessage = useSelector(selectTaskMessage);
  const userStatus = useSelector(selectUserStatus);
  const userMessage = useSelector(selectUserMessage);
  const userGroupStatus = useSelector(selectUserGroupStatus);
  const userGroupMessage = useSelector(selectUserGroupMessage);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [severity, setSeverity] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackbarClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (taskStatus === 'succeeded' || taskStatus === 'failed') {
      setSeverity(taskStatus === 'failed' ? 'error' : 'success');
      setSnackbarMessage(taskMessage);
      setSnackbarOpen(true);
    } else if (taskStatus === 'loading') {
      setSnackbarOpen(false);
    }

  }, [taskStatus]);

  useEffect(() => {
    if (userGroupStatus === 'succeeded' || userGroupStatus === 'failed') {
      setSeverity(userGroupStatus === 'failed' ? 'error' : 'success');
      setSnackbarMessage(userGroupMessage);
      setSnackbarOpen(true);
    } else if (userGroupStatus === 'loading') {
      setSnackbarOpen(false);
    }

  }, [userGroupStatus]);

  useEffect(() => {
    console.log(userStatus)
    console.log(userMessage)
    if (userStatus === 'succeeded' || userStatus === 'failed') {
      setSeverity(userStatus === 'failed' ? 'error' : 'success');
      setSnackbarMessage(userMessage);
      setSnackbarOpen(true);
    } else if (userStatus === 'loading') {
      setSnackbarOpen(false);
    }
  }, [userStatus]);
  
  return (
    <Snackbar open={snackbarOpen} autoHideDuration={6000}>
      <Alert onClose={handleSnackbarClose} severity={severity}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
}