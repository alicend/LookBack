import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import {
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Button,
  Fab,
  SelectChangeEvent,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import jaLocale from "dayjs/locale/ja";
import React, { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import EditCategoryModal from "./categoryModal/EditCategoryModal";
import NewCategoryModal from "./categoryModal/NewCategoryModal";
import {
  fetchAsyncCreateTask,
  fetchAsyncUpdateTask,
  selectUsers,
  selectEditedTask,
  selectCategory,
  editTask,
  selectTask,
  fetchAsyncDeleteTask,
  initialState,
} from "@/slices/taskSlice";
import { AppDispatch } from "@/store/store";
import { CATEGORY } from "@/types/CategoryType";

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  width: "90%",
  minWidth: 240,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: "90%",
  minWidth: 240,
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: "90%",
  minWidth: 240,
}));

const StyledCategoryFormControl = styled(FormControl)(({ theme }) => ({
  width: "45%",
  minWidth: 240,
}));

const TaskSaveButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
  backgroundColor: "#4dabf5 !important",
  "&:hover": {
    backgroundColor: "#1769aa !important",
  },
  "&:disabled": {
    backgroundColor: "#ccc !important",
    cursor: "not-allowed",
  },
}));

const TaskDeleteButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(2),
  backgroundColor: "#f6685e !important",
  "&:hover": {
    backgroundColor: "#aa2e25 !important",
  },
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  backgroundColor: "#4dabf5 !important",
  "&:hover": {
    backgroundColor: "#1769aa !important",
  },
  "&:disabled": {
    backgroundColor: "#ccc !important",
    cursor: "not-allowed",
  },
}));

const TaskForm: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  const users = useSelector(selectUsers);
  const categories = useSelector(selectCategory);
  const editedTask = useSelector(selectEditedTask);

  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CATEGORY>({
    ID: 0,
    Category: "",
  });

  useEffect(() => {
    const selectedCategoryObj = categories.find(
      (cat) => cat.ID === editedTask.Category,
    );
    if (selectedCategoryObj) {
      setSelectedCategory(selectedCategoryObj);
    }
  }, [editedTask.Category, categories]);

  const handleNewCategoryOpen = () => {
    setNewCategoryOpen(true);
  };
  const handleNewCategoryClose = () => {
    setNewCategoryOpen(false);
  };

  const handleEditCategoryOpen = () => {
    setEditCategoryOpen(true);
  };
  const handleEditCategoryClose = () => {
    setEditCategoryOpen(false);
  };
  const isDisabled =
    editedTask.Task.length === 0 ||
    editedTask.Description.length === 0 ||
    editedTask.Responsible === 0 ||
    editedTask.Category === 0 ||
    editedTask.StartDate.length === 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    const name = e.target.name;
    if (name === "Estimate") {
      value = Number(value);
      // 範囲外の値を修正
      if (value < 1) {
        value = 1;
      } else if (value > 1000) {
        value = 1000;
      }
    }
    dispatch(editTask({ ...editedTask, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const value = Number(e.target.value);
    const name = e.target.name;
    dispatch(editTask({ ...editedTask, [name]: value }));
  };

  const handleSelectDateChange = (date: any) => {
    if (date.$d instanceof Date && !isNaN(date.$d.getTime())) {
      dispatch(editTask({ ...editedTask, StartDate: date.toISOString() }));
    } else {
      dispatch(editTask({ ...editedTask, StartDate: "" }));
    }
  };

  const userOptions = [{ ID: 0, Name: "" }, ...users].map((user) => (
    <MenuItem key={user.ID} value={user.ID} style={{ minHeight: "36px" }}>
      {user.Name}
    </MenuItem>
  ));
  const categoryOptions = [{ ID: 0, Category: "" }, ...categories].map(
    (cat) => (
      <MenuItem key={cat.ID} value={cat.ID} style={{ minHeight: "36px" }}>
        {cat.Category}
      </MenuItem>
    ),
  );
  return (
    <Grid container direction="column" style={{ minHeight: "80vh" }}>
      <h2 className="toScroll">{editedTask.ID ? "Update Task" : "New Task"}</h2>
      <form>
        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={jaLocale.name}
            >
              <StyledDatePicker
                label="Start Date"
                value={dayjs(editedTask.StartDate)}
                onChange={handleSelectDateChange}
                format="YYYY/MM/DD"
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledTextField
              label="Estimate [days]"
              type="number"
              name="Estimate"
              InputProps={{ inputProps: { min: 1, max: 1000 } }}
              InputLabelProps={{
                shrink: true,
                inputMode: "numeric",
              }}
              value={editedTask.Estimate}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledTextField
              InputLabelProps={{
                shrink: true,
              }}
              label="Task"
              type="text"
              name="Task"
              value={editedTask.Task}
              onChange={handleInputChange}
              inputProps={{
                maxLength: 30,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledTextField
              InputLabelProps={{
                shrink: true,
              }}
              label="Description"
              type="text"
              name="Description"
              value={editedTask.Description}
              onChange={handleInputChange}
              inputProps={{
                maxLength: 30,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledFormControl>
              <InputLabel>Responsible</InputLabel>
              <Select
                name="Responsible"
                onChange={handleSelectChange}
                value={editedTask.Responsible}
              >
                {userOptions}
              </Select>
            </StyledFormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledFormControl>
              <InputLabel>Status</InputLabel>
              <Select
                name="Status"
                value={editedTask.Status}
                onChange={handleSelectChange}
              >
                <MenuItem value={1}>未着</MenuItem>
                <MenuItem value={2}>進行中</MenuItem>
                <MenuItem value={3}>完了</MenuItem>
                <MenuItem value={4}>Look Back</MenuItem>
              </Select>
            </StyledFormControl>
          </Grid>
          <Grid item xs={12}>
            <Grid container direction="row" justifyContent="center">
              <StyledCategoryFormControl>
                <InputLabel>Category</InputLabel>
                <Select
                  name="Category"
                  value={editedTask.Category}
                  onChange={handleSelectChange}
                >
                  {categoryOptions}
                </Select>
              </StyledCategoryFormControl>

              <StyledFab
                size="small"
                color="primary"
                onClick={
                  editedTask.Category
                    ? handleEditCategoryOpen
                    : handleNewCategoryOpen
                }
              >
                {editedTask.Category ? <EditOutlinedIcon /> : <AddIcon />}
              </StyledFab>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Grid container direction="row" justifyContent="center">
              <TaskSaveButton
                variant="contained"
                color="primary"
                size="small"
                startIcon={<SaveIcon />}
                disabled={isDisabled}
                onClick={
                  editedTask.ID !== 0
                    ? () => dispatch(fetchAsyncUpdateTask(editedTask))
                    : () => dispatch(fetchAsyncCreateTask(editedTask))
                }
              >
                {editedTask.ID !== 0 ? "Update" : "Save"}
              </TaskSaveButton>
              {editedTask.ID !== 0 ? (
                <TaskDeleteButton
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutlineOutlinedIcon />}
                  onClick={() => {
                    dispatch(fetchAsyncDeleteTask(editedTask.ID));
                    dispatch(editTask(initialState.editedTask));
                    dispatch(selectTask(initialState.selectedTask));
                  }}
                >
                  DELETE
                </TaskDeleteButton>
              ) : (
                ""
              )}
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
          </Grid>
        </Grid>
      </form>

      <NewCategoryModal
        open={newCategoryOpen}
        onClose={handleNewCategoryClose}
      />
      <EditCategoryModal
        open={editCategoryOpen}
        onClose={handleEditCategoryClose}
        originalCategory={selectedCategory}
      />
    </Grid>
  );
};

export default TaskForm;
