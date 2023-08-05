import React, { useEffect, useState } from "react";

import { Snackbar, Alert } from '@mui/material';
import { Grid } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

import { useSelector, useDispatch } from "react-redux";
import {
  fetchAsyncGetTasks,
  selectStatus,
  selectMessage,
  selectTasks
} from "@/slices/taskSlice";

import { AppDispatch } from "@/store/store";
import { MainPageLayout } from "@/components/layout/MainPageLayout";
import { CustomToolbar } from "@/components/calendar/CustomToolbar";

const theme = createTheme({
  palette: {
    secondary: {
      main: "#3cb371",
    },
  },
});

const localizer = momentLocalizer(moment);

export default function LookBack() {

  const dispatch: AppDispatch = useDispatch();
  const status = useSelector(selectStatus);
  const message = useSelector(selectMessage);
  const tasks = useSelector(selectTasks);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackbarClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const tasksToEvents = (tasks) => {
    return tasks.map(task => ({
      start: new Date(task.StartDate),
      end: moment(task.StartDate).add(task.Estimate, 'days').toDate(),
      title: task.Task,
      desc: task.Description,
      // 他の任意のプロパティもここに追加できます
    }));
  };

  const events = tasksToEvents(tasks);

  useEffect(() => {
    if (status === 'succeeded' || status === 'failed') {
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    } else if (status === 'loading') {
      setSnackbarOpen(false);
    }
  }, [status]);
  
  useEffect(() => {
    const fetchBootLoader = async () => {
      await dispatch(fetchAsyncGetTasks());
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <MainPageLayout title="Look Back">
      <ThemeProvider theme={theme}>
        <Grid item xs={12} style={{ height: '800px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            tooltipAccessor="desc"
            views={['month']}
            components={{
              toolbar: CustomToolbar
            }}
          />
        </Grid>
      </ThemeProvider>
      <Snackbar open={snackbarOpen} autoHideDuration={6000}>
        <Alert onClose={handleSnackbarClose} severity={status === 'failed' ? 'error' : 'success'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainPageLayout>
  )
}






