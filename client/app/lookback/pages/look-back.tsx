import React, { useEffect, useState } from "react";

import { Grid } from "@mui/material";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

import { useSelector, useDispatch } from "react-redux";
import { selectTasks, selectTask, fetchAsyncGetLookBackTasks } from "@/slices/taskSlice";

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

const localizer = momentLocalizer(moment);

export default function LookBack() {

  const dispatch: AppDispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStyle] = useState(getModalStyle);

  const handleModalOpen = (event: any) => {
    const selectedEvent = tasks.find(task => task.Task === event.title);
    if (selectedEvent) {
      setModalOpen(true);
      dispatch(selectTask(selectedEvent));
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
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
    const fetchBootLoader = async () => {
      await dispatch(fetchAsyncGetLookBackTasks());
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <MainPageLayout title="Look Back">
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
          onSelectEvent={handleModalOpen}
        />
      </Grid>
      <CalenderModal 
        open={modalOpen}
        onClose={handleModalClose}
        modalStyle={modalStyle}
      />
    </MainPageLayout>
  )
}