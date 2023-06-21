import React, { FC } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTaskGroups } from "@/hooks/useTaskGroups";
import { Column } from "./Column";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ResponseData } from "@/types/ResponseData";

const fetchUserTasks = async () => {
  try {
    // const response: AxiosResponse<ResponseData> = await axios.get(
    //     `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks`,
    //     { headers: {
    //         "Content-Type": "application/json"
    //       }
    //     }
    // );

    // axios will throw an error when the status is not in the range of 2xx
    // so there is no need to check for 400 specifically
    // the data property will contain the parsed JSON response body

    // console.log(response);
    console.log("fetchUserTasks");
  } catch (err: any) {
    console.log(err);
    // if the request is made and the server responds with a 
    // status code that falls out of the range of 2xx an error is thrown
    const error: AxiosError = err;
    if (error.response && error.response.status === 400) {
        alert("authentication failed");
    } else {
        alert(error);
    }
  }
};

export const TaskArea: FC = () => {

  const [
    tasks,
    updateTasks,
    swapTasks,
    deleteTasks,
  ] = useTaskGroups();

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
