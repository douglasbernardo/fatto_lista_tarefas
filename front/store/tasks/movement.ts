import { defineStore } from "pinia";
import { doc, updateDoc } from "firebase/firestore";
import { db } from '~/firebaseConfig';
import { useTaskStore } from "./task_manager";

export const useMovement = defineStore("movementManager",{
    state: () => ({}),
    actions: {
        async moveTask(direction: string,task: object, index: number){
            const tasksManager = useTaskStore()

            if(direction === 'up' && index > 0) {
              const upTask = tasksManager.tasks[index - 1]
              await this.updateOrder(task, upTask, tasksManager)
              tasksManager.tasks[index] = { ...upTask, ordem: task.ordem };
              tasksManager.tasks[index-1] = { ...task, ordem: upTask.ordem };
            } 
            else if(direction === 'down' && index < tasksManager.tasks.length  - 1){
              const belowTask = tasksManager.tasks[index + 1]
              await this.updateOrder(task, belowTask, tasksManager)
        
              tasksManager.tasks[index] = { ...belowTask, ordem: task.ordem };
              tasksManager.tasks[index + 1] = { ...task, ordem: belowTask.ordem };
            }
        },
        
        async updateOrder(task1:  object, task2: object, taskManager){ 
            const task1Ref = doc(db, 'tarefas', task1.id);
            const task2Ref = doc(db, 'tarefas', task2.id);
        
            await updateDoc(task1Ref, { ordem: task2.ordem });
            await updateDoc(task2Ref, { ordem: task1.ordem });
        
            await taskManager.get_all_tasks();
          }
    }
})