import {
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  editTask,
  initialState,
  selectSelectedTask,
  selectTask,
} from "@/slices/taskSlice";
import { AppDispatch } from "@/store/store";

const TaskDisplay: React.FC = () => {
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
    { item: "Status", data: selectedTask.StatusName },
    { item: "Created", data: selectedTask.CreatedAt },
    { item: "Updated", data: selectedTask.UpdatedAt },
  ];

  if (!selectedTask.Task) {
    return null;
  }

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      style={{ minHeight: "80vh" }}
    >
      <h2 className="toScroll">Task details</h2>
      <Table style={{ width: "90%" }}>
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
          dispatch(editTask(initialState.editedTask));
          dispatch(selectTask(initialState.selectedTask));
        }}
      >
        Cancel
      </Button>
    </Grid>
  );
};

export default TaskDisplay;
