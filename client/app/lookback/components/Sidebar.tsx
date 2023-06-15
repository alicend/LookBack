import React, { FC } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTaskGroups } from "@/hooks/useTaskGroups";
import { Column } from "./Column";

export const Sidebar: FC = () => {

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
              {taskGroupsNames.map((taskGroupName, columnIndex) => {
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
