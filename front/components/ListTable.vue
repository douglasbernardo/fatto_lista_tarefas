<template>
  <v-container>
    <div class="bg-grey text-center text-h4 ma-2 pa-2">Lista de Tarefas</div>
    <v-btn class="bg-blue ma-2" @click="insertTask=true" prepend-icon="mdi-plus-circle" variant="text">Adicionar Nova Tarefa</v-btn>
    <v-table class="ma-2">
      <thead class="bg-grey">
        <tr>
          <th class="text-left" v-for="item in tableHeaders" v-text="item" />
          <th colspan="2">Ordem</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(task ,index) in tasksManager.tasks"
          :key="task.id"
          :class="{'bg-yellow-lighten-3': task.cost > 1000}"
        >
          <td>#{{ task.id }}</td>
          <td>{{ task.name }}</td>
          <td>{{ Intl.NumberFormat('pt-br',{ style: 'currency', currency: 'BRL' }).format(task.cost) }}</td>
          <td>{{ task.date }}</td>
          <td>
            <v-btn icon="mdi-pencil" @click="edit(task.id)" variant="text"/>
            <v-btn icon="mdi-delete" @click="deletes(task.name, task.id)" variant="text" color="red"/>
          </td>
          <td>
            <v-btn color="green" :disabled="index == 0" icon="mdi-arrow-up" variant="text" @click="moveTask('up', task,index)"></v-btn>
            <v-btn color="blue" :disabled="index === tasksManager.tasks.length - 1" icon="mdi-arrow-down" @click="moveTask('down', task,index)" variant="text"></v-btn>
          </td>
        </tr>
        <h3 v-if="!tasksManager.tasks.length" class="text-center">Não há tarefas cadastradas no momento</h3>
      </tbody>
    </v-table>
    <v-dialog v-model="insertTask" width="auto">
      <v-card max-width="auto">
      <v-card-title class="bg-grey text-center">
        {{!isEditing ? 'Adicionar Nova Tarefa' : 'Editar Tarefa'}}
      </v-card-title>
      <v-sheet class="mx-auto" width="400">
      <p v-if="errorInsert" class="bg-red text-center ma-2">{{ errorInsert }}</p>
    <v-form fast-fail @submit.prevent class="ma-2">
      <v-text-field
        v-model="dataInsert.name"
        label="Nome da Tarefa"
      ></v-text-field>
      <v-text-field
        v-model="dataInsert.cost"
        label="Custo da Tarefa"
      ></v-text-field>
      <v-text-field
        v-model="dataInsert.date"
        label="Data Limite"
      ></v-text-field>
    </v-form>
  </v-sheet>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn  
          v-if="!isEditing"
          class="bg-blue"
          text="Adicionar"
          block
          @click="addTask"
        ></v-btn>
        <v-btn
          v-else
          class="bg-blue"
          text="Editar"
          block
          @click="editTask"
        ></v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>
    <v-dialog v-model="deleteTaskDialog" width="auto">
      <v-card max-width="auto">
      <v-card-title class="bg-grey">Deletar Tarefa: {{ nameToDelete }}</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
        class="bg-red"
          text="Deletar"
          @click="deleteTask"
        ></v-btn>
        <v-btn
        class="bg-blue"
          text="Voltar"
          @click="deleteTaskDialog = false"
        ></v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup lang="ts">
  import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
  import { db } from '~/firebaseConfig';
  import { useTaskStore } from '~/store/tasks/task_manager';

  const tasksManager = useTaskStore()

  const tableHeaders = ref(['ID','Nome da Tarefa','Custo','Data Limite', 'Ações'])
  const deleteTaskDialog = ref(false)
  const insertTask = ref(false)
  const isEditing = ref(false)
  const idEdit = ref("")
  const nameToDelete = ref("")
  const idDelete = ref("")
  const dataInsert = reactive({ name: '', cost: '', date: '' })
  const errorInsert = ref('')

  onMounted(() =>{
    tasksManager.get_all_tasks()
  })
  
  const clearData = (() => { [dataInsert.name, dataInsert.cost, dataInsert.date] = '' })

  const deletes = ((name: string, id: string) => {
    nameToDelete.value = name
    idDelete.value = id
    deleteTaskDialog.value = true
  })
  const deleteTask = () => {
    tasksManager.delete_task(idDelete.value)
    deleteTaskDialog.value = false
  }

  const verifyName = (async(name: string) => {
    if (!name || name.trim() === "") return true;
    const q = query(collection(db, "tarefas"), where("name", "==", name));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty
  })

  const edit = (async(taskId: string) => {
    idEdit.value = taskId
    isEditing.value = true
    insertTask.value = true
    const q = doc(db, "tarefas", taskId); // Referência ao documento
    const querySnapshot = await getDoc(q)
    dataInsert.name = querySnapshot.data().name
    dataInsert.cost = querySnapshot.data().cost
    dataInsert.date = querySnapshot.data().date
  })
  const editTask = (async() => {
    const q = query(collection(db, "tarefas"), where("name", "==", dataInsert.name.trim()));
    const querySnapshot = await getDocs(q);
    if(!querySnapshot.docs.some(doc => doc.id !== idEdit.value)){
      await tasksManager.editTask(idEdit.value,dataInsert)
      clearData()
      insertTask.value = false
      errorInsert.value = ''
    }else{
      errorInsert.value = 'Essa tarefa já existe, escolha outro nome!'
    }
  })

  const addTask = async() => {
    const nameExists = await verifyName(dataInsert.name.trim())
    if(!nameExists){
      errorInsert.value = ''
      await tasksManager.add_task(dataInsert)
      insertTask.value = false
      clearData()
    }else{
      errorInsert.value = 'Essa tarefa já existe, escolha outro nome!'
    }
  }

  const moveTask = async (direction: string,task: object, index: number) => {
    if(direction === 'up' && index > 0) {
      const upTask = tasksManager.tasks[index - 1]
      await updateOrder(task, upTask)
      tasksManager.tasks[index] = { ...upTask, ordem: task.ordem };
      tasksManager.tasks[index-1] = { ...task, ordem: upTask.ordem };
    } 
    else if(direction === 'down' && index < tasksManager.tasks.length  - 1){
      const belowTask = tasksManager.tasks[index + 1]
      await updateOrder(task, belowTask)

      tasksManager.tasks[index] = { ...belowTask, ordem: task.ordem };
      tasksManager.tasks[index + 1] = { ...task, ordem: belowTask.ordem };
    }
  }

  const updateOrder = async (task1: object, task2: object) => { 
    const task1Ref = doc(db, 'tarefas', task1.id);
    const task2Ref = doc(db, 'tarefas', task2.id);

    await updateDoc(task1Ref, { ordem: task2.ordem });
    await updateDoc(task2Ref, { ordem: task1.ordem });

    await tasksManager.get_all_tasks();
  }
</script>