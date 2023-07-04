import { useState, useEffect } from "react";
import axios from "axios";
import { READ_TASK, USER, CATEGORY, POST_TASK } from "@/types/type";
export const useTasks = () => {
  const [tasks, setTasks] = useState<READ_TASK[]>([]);
  const [selectedTask, setSelectedTask] = useState<READ_TASK | null>(null);
  const [editedTask, setEditedTask] = useState<POST_TASK | null>(null);
  const [users, setUsers] = useState<USER[]>([]);
  const [category, setCategory] = useState<CATEGORY[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await axios.get<READ_TASK[]>(
        `${process.env.REACT_APP_API_URL}/api/tasks/`,
        {
          headers: {
            Authorization: `JWT ${localStorage.localJWT}`,
          },
        }
      );
      setTasks(res.data);
    };

    const fetchUsers = async () => {
      const res = await axios.get<USER[]>(
        `${process.env.REACT_APP_API_URL}/api/users/`,
        {
          headers: {
            Authorization: `JWT ${localStorage.localJWT}`,
          },
        }
      );
      setUsers(res.data);
    };

    const fetchCategory = async () => {
      const res = await axios.get<CATEGORY[]>(
        `${process.env.REACT_APP_API_URL}/api/category/`,
        {
          headers: {
            Authorization: `JWT ${localStorage.localJWT}`,
          },
        }
      );
      setCategory(res.data);
    };

    fetchTasks();
    fetchUsers();
    fetchCategory();
  }, []);

  const createTask = async (task: POST_TASK) => {
    const res = await axios.post<READ_TASK>(
      `${process.env.REACT_APP_API_URL}/api/tasks/`,
      task,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    setTasks([res.data, ...tasks]);
    setEditedTask(null);
  };

  const updateTask = async (task: POST_TASK) => {
    const res = await axios.put<READ_TASK>(
      `${process.env.REACT_APP_API_URL}/api/tasks/${task.id}/`,
      task,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    setTasks(tasks.map((t) => (t.id === task.id ? res.data : t)));
    setEditedTask(null);
    setSelectedTask(null);
  };

  const deleteTask = async (id: number) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/${id}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    setTasks(tasks.filter((t) => t.id !== id));
    setEditedTask(null);
    setSelectedTask(null);
  };

  return {
    tasks,
    selectedTask,
    editedTask,
    users,
    category,
    setSelectedTask,
    setEditedTask,
    createTask,
    updateTask,
    deleteTask,
  };
};
