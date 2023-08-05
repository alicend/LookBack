import React, { useEffect, useState } from "react";

import { Snackbar, Alert} from '@mui/material';
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
  selectTasks,
  selectTask,
  editTask,
  initialState
} from "@/slices/taskSlice";

import { AppDispatch } from "@/store/store";
import { MainPageLayout } from "@/components/layout/MainPageLayout";
import { CustomToolbar } from "@/components/calendar/CustomToolbar";
import { READ_TASK } from "@/types/TaskType";
import CalenderModal from "@/components/calendar/CalenderModal";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

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
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [modalStyle] = useState(getModalStyle);

  const handleOpen = (event: any) => {
    const selectedEvent = tasks.find(task => task.Task === event.title);
    if (selectedEvent) {
      handleNewCategoryOpen();
      dispatch(selectTask(selectedEvent));
      dispatch(editTask(initialState.editedTask));
    }
  };

  const handleNewCategoryOpen = () => {
    setNewCategoryOpen(true);
  };
  const handleNewCategoryClose = () => {
    setNewCategoryOpen(false);
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const tasksToEvents = (tasks: READ_TASK[]) => {
    return tasks.map(task => ({
      start: new Date(task.StartDate),
      end: moment(task.StartDate).add(task.Estimate, 'days').toDate(),
      title: task.Task,
      desc: task.Description,
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
        <Grid item xs={12} style={{ minHeight: '800px' }}>
          <Calendar
            localizer={localizer}
            showAllEvents={true}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            tooltipAccessor="desc"
            views={['month']}
            components={{
              toolbar: CustomToolbar
            }}
            onSelectEvent={handleOpen}
          />
        </Grid>
        <CalenderModal 
          open={newCategoryOpen}
          onClose={handleNewCategoryClose}
          modalStyle={modalStyle}
        />
      </ThemeProvider>
      
      <Snackbar open={snackbarOpen} autoHideDuration={6000}>
        <Alert onClose={handleSnackbarClose} severity={status === 'failed' ? 'error' : 'success'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainPageLayout>
  )
}