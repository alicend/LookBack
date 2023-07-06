import React, { useState, useEffect } from "react";

import { styled } from '@mui/system';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Button,
  Avatar,
  Badge,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TableSortLabel,
} from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import {
  fetchAsyncDeleteTask,
  selectTasks,
  editTask,
  selectTask,
} from "@/reducer/taskSlice";
import { selectLoginUser, selectProfiles } from "@/reducer/authSlice";
import { AppDispatch } from "@/utils/store";
import { initialState } from "@/reducer/taskSlice";
import { SORT_STATE, READ_TASK } from "@/types/type";

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3),
  '&:disabled': {
    color: '#ccc',
    cursor: 'not-allowed'
  },
}));

const StyledTable = styled(Table)`
  table-layout: fixed;
`;

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  margin: 'auto',
  width: theme.spacing(3),
  height: theme.spacing(3),
}));

const TaskList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const tasks = useSelector(selectTasks);
  const loginUser = useSelector(selectLoginUser);
  const profiles = useSelector(selectProfiles);
  const columns = tasks[0] && Object.keys(tasks[0]);

  const [state, setState] = useState<SORT_STATE>({
    rows: tasks,
    order: "desc",
    activeKey: "",
  });

  const handleClickSortColumn = (column: keyof READ_TASK) => {
    const isDesc = column === state.activeKey && state.order === "desc";
    const newOrder = isDesc ? "asc" : "desc";
    const sortedRows = Array.from(state.rows).sort((a, b) => {
      if (a[column] > b[column]) {
        return newOrder === "asc" ? 1 : -1;
      } else if (a[column] < b[column]) {
        return newOrder === "asc" ? -1 : 1;
      } else {
        return 0;
      }
    });

    setState({
      rows: sortedRows,
      order: newOrder,
      activeKey: column,
    });
  };

  useEffect(() => {
    setState((state) => ({
      ...state,
      rows: tasks,
    }));
  }, [tasks]);

  const renderSwitch = (statusName: string) => {
    switch (statusName) {
      case "Not started":
        return (
          <Badge variant="dot" color="error">
            {statusName}
          </Badge>
        );
      case "On going":
        return (
          <Badge variant="dot" color="primary">
            {statusName}
          </Badge>
        );
      case "Done":
        return (
          <Badge variant="dot" color="secondary">
            {statusName}
          </Badge>
        );
      default:
        return null;
    }
  };

  const conditionalSrc = (user: number) => {
    const loginProfile = profiles.filter(
      (prof) => prof.user_profile === user
    )[0];
    return loginProfile?.img !== null ? loginProfile?.img : undefined;
  };

  return (
    <>
      <StyledButton
        variant="contained"
        color="primary"
        size="small"
        startIcon={<AddCircleOutlineIcon />}
        onClick={() => {
          dispatch(
            editTask({
              id: 0,
              task: "",
              description: "",
              criteria: "",
              responsible: loginUser.id,
              status: "1",
              category: 1,
              estimate: 0,
            })
          );
          dispatch(selectTask(initialState.selectedTask));
        }}
      >
        Add new
      </StyledButton>
      {tasks[0]?.task && (
        <StyledTable size="small" >
          <TableHead>
            <TableRow>
              {columns.map(
                (column, colIndex) =>
                  (column === "task" ||
                    column === "status" ||
                    column === "category" ||
                    column === "estimate" ||
                    column === "responsible" ||
                    column === "owner") && (
                    <TableCell align="center" key={colIndex}>
                      <TableSortLabel
                        active={state.activeKey === column}
                        direction={state.order}
                        onClick={() => handleClickSortColumn(column)}
                      >
                        <strong>{column}</strong>
                      </TableSortLabel>
                    </TableCell>
                  )
              )}
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.rows.map((row, rowIndex) => (
              <TableRow hover key={rowIndex}>
                {Object.keys(row).map(
                  (key, colIndex) =>
                    (key === "task" ||
                      key === "status_name" ||
                      key === "category_item" ||
                      key === "estimate") && (
                      <TableCell
                        align="center"
                        className="cursor-pointer"
                        key={`${rowIndex}+${colIndex}`}
                        onClick={() => {
                          dispatch(selectTask(row));
                          dispatch(editTask(initialState.editedTask));
                        }}
                      >
                        {key === "status_name" ? (
                          renderSwitch(row[key])
                        ) : (
                          <span>{row[key]}</span>
                        )}
                      </TableCell>
                    )
                )}
                <TableCell>
                  <SmallAvatar
                    alt="resp"
                    src={conditionalSrc(row["responsible"])}
                  />
                </TableCell>
                <TableCell>
                  <SmallAvatar
                    alt="owner"
                    src={conditionalSrc(row["owner"])}
                  />
                </TableCell>

                <TableCell align="center">
                  <div className="text-gray-400 cursor-not-allowed">
                    <button
                      className="cursor-pointer bg-transparent border-none outline-none text-lg mt-2 text-gray-500"
                      onClick={() => {
                        dispatch(fetchAsyncDeleteTask(row.id));
                      }}
                      disabled={row["owner"] !== loginUser.id}
                    >
                      <DeleteOutlineOutlinedIcon />
                    </button>
                  </div>
                  <div className="text-gray-400 cursor-not-allowed">
                    <button
                      className="cursor-pointer bg-transparent border-none outline-none text-lg mt-2 text-gray-500"
                      onClick={() => dispatch(editTask(row))}
                      disabled={row["owner"] !== loginUser.id}
                    >
                      <EditOutlinedIcon />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      )}
    </>
  );
};

export default TaskList;