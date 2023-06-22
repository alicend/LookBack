import React, { FC, useEffect } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTaskGroups } from "@/hooks/useTaskGroups";
import { Column } from "./Column";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ResponseData } from "@/types/ResponseData";
import { DraggableItem } from "@/types/DraggableItem";
import { ItemTypes } from "@/types/ItemTypes";
import { ResponseTask } from "@/types/ResponseTask";

const fetchUserTasks = async (): Promise<DraggableItem[]> => {
  try {
    const response: AxiosResponse<ResponseData> = await axios.get(
        `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks`,
        { headers: {
            "Content-Type": "application/json"
          }
        }
    );

    let responseData = response.data;

    console.log(response.data);
    let tasks = responseData.tasks.map((task: ResponseTask) => ({
      key: String(task.TaskIndex), 
      groupName: task.Status,
      contents: task.Content,
      type: ItemTypes.card,
    }));
    return tasks;
  } catch (err: any) {
    console.log(err);
    const error: AxiosError = err;
    if (error.response && error.response.status === 400) {
      console.log(error.response);
      alert("authentication failed");
    } else {
      alert(error.response);
    }
    // エラーの場合は空の配列を返す
    return [];
  }
};

export const TaskArea: FC = () => {

  const [
    tasks,
    updateTasks,
    swapTasks,
    deleteTasks,
    setTasks,
  ] = useTaskGroups();

  useEffect(() => {
    (async () => {
      const fetchedTasks = await fetchUserTasks();
      if (fetchedTasks) setTasks(fetchedTasks);
    })();
  }, []);

  const taskGroupsNames = ["TODO", "作業中", "完了"];

  let index = 0;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen">
        <div className="mt-8 h-full">
          <div className="m-4 h-full">
            <div className="flex h-full gap-4">
              {taskGroupsNames.map((taskGroupName) => {
                const groupedTasks = tasks.filter((task) => {
                  return task.groupName === taskGroupName;
                });
                const firstIndex = index;
                index += groupedTasks.length;
                return (
                  <li key={taskGroupName} className="list-none">
                    <Column
                      columnName={taskGroupName}
                      firstIndex={firstIndex}
                      tasks={groupedTasks}
                      updateTasks={updateTasks}
                      deleteTasks={deleteTasks}
                      swapTasks={swapTasks}
                    ></Column>
                  </li>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
