import React from "react";
import { useSelector } from "react-redux";
import { selectSelectedTask } from "@/reducer/taskSlice";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";

const TaskDisplay: React.FC = () => {
  const selectedTask = useSelector(selectSelectedTask);
  const rows = [
    { item: "Task", data: selectedTask.Task },
    { item: "Description", data: selectedTask.Description },
    { item: "Owner", data: selectedTask.StatusName },
    { item: "Responsible", data: selectedTask.Responsible_UserName },
    { item: "StartDate", data: selectedTask.StartDate },
    { item: "Estimate [days]", data: selectedTask.Estimate },
    { item: "Category", data: selectedTask.CategoryName },
    { item: "Status", data: selectedTask.StatusName },
    { item: "Created", data: selectedTask.created_at },
    { item: "Updated", data: selectedTask.updated_at },
  ];

  if (!selectedTask.Task) {
    return null;
  }

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
    </>
  );
};

export default TaskDisplay;