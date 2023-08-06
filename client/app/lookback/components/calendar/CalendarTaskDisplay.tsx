import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAsyncUpdateTask, fetchAsyncUpdateTaskToMoveToCompleted, selectEditedTask, selectSelectedTask } from "@/slices/taskSlice";
import { Button, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { AppDispatch } from "@/store/store";

interface CalendarTaskDisplayProps {
  onClose: () => void;
}

const CalendarTaskDisplay: React.FC<CalendarTaskDisplayProps> = ({ onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const selectedTask = useSelector(selectSelectedTask);

  const rows = [
    { item: "Task", data: selectedTask.Task },
    { item: "Description", data: selectedTask.Description },
    { item: "Creator", data: selectedTask.CreatorUserName },
    { item: "Responsible", data: selectedTask.ResponsibleUserName },
    { item: "StartDate", data: selectedTask.StartDate },
    { item: "Estimate [days]", data: selectedTask.Estimate },
    { item: "Category", data: selectedTask.CategoryName },
    { item: "Created", data: selectedTask.CreatedAt },
    { item: "Updated", data: selectedTask.UpdatedAt },
  ];

  return (
    <>
      <h2>Task details</h2>
      <Table>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.item}>
              <TableCell align="center">
                <strong>{row.item}</strong>
              </TableCell>
              <TableCell align="center">{row.data}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <br />
      <Button
        variant="contained"
        color="inherit"
        size="small"
        onClick={() => {
          dispatch(fetchAsyncUpdateTaskToMoveToCompleted(selectedTask));
          onClose();
        }}
      >
        Move to Completed
      </Button>
    </>
  );
};

export default CalendarTaskDisplay;