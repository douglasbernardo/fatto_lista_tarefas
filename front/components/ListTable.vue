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
            <v-btn color="green" :disabled="index == 0" icon="mdi-arrow-up" variant="text" @click="moveTasks.moveTask('up', task,index)"></v-btn>
            <v-btn color="blue" :disabled="index === tasksManager.tasks.length - 1" icon="mdi-arrow-down" @click="moveTasks.moveTask('down', task,index)" variant="text"></v-btn>
          </td>
        </tr>
        <h3 v-if="!tasksManager.tasks.length" class="text-center">Não há tarefas cadastradas no momento</h3>
      </tbody>
    </v-table>
    <v-dialog persistent v-model="insertTask" width="auto">
      <v-card max-width="auto">
      <v-card-title class="bg-grey text-center">
        {{!isEditing ? 'Adicionar Nova Tarefa' : 'Editar Tarefa'}}
      </v-card-title>
      <v-sheet class="mx-auto" width="400">
      <v-alert 
        v-for="error in tasksManager.errorMessages"
        class="bg-red text-center ma-2" 
        :text="error"
      />
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
        placeholder="Exemplo 12/10/2024"
      ></v-text-field>
    </v-form>
  </v-sheet>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn  
          v-if="!isEditing"
          class="bg-blue"
          text="Adicionar"
          @click="addTask"
        ></v-btn>
        <v-btn
          v-else
          class="bg-blue"
          text="Editar"
          @click="editTask"
        ></v-btn>
        <v-btn
          class="bg-red-lighten-2"
          text="Cancelar"
          @click="clearDialog"
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
  import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
  import { db } from '~/firebaseConfig';
  import { useTaskStore } from '~/store/tasks/task_manager';
  import { useMovement } from '~/store/tasks/movement';

  const tasksManager = useTaskStore()
  const moveTasks = useMovement()

  const tableHeaders = ref(['ID','Nome da Tarefa','Custo','Data Limite', 'Ações'])
  const deleteTaskDialog = ref(false)
  const insertTask = ref(false)
  const isEditing = ref(false)
  const idEdit = ref("")
  const nameToDelete = ref("")
  const idDelete = ref("")
  const dataInsert = reactive({ name: '', cost: '', date: '' })

  onMounted(() =>{
    tasksManager.get_all_tasks()
  })
  
  const clearData = (() => { [dataInsert.name, dataInsert.cost, dataInsert.date] = '' })
  const clearDialog = () => {
    clearData()
    tasksManager.errorMessages = []
    insertTask.value = false
    isEditing.value = false
  }

  const deletes = ((name: string, id: string) => {
    nameToDelete.value = name
    idDelete.value = id
    deleteTaskDialog.value = true
  })
  const deleteTask = () => {
    tasksManager.delete_task(idDelete.value)
    deleteTaskDialog.value = false
  }

  const edit = (async(taskId: string) => {
    idEdit.value = taskId
    isEditing.value = true
    insertTask.value = true
    const q = doc(db, "tarefas", taskId);
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
      isEditing.value = false
    }else{
      tasksManager.errorMessages.push('Essa tarefa já existe, escolha outro nome!')
    }
  })

  const addTask = async() => {
    isEditing.value = false
    await tasksManager.add_task(dataInsert)
    if(tasksManager.errorMessages.length < 1) 
      tasksManager.get_all_tasks() 
      insertTask.value = false
    insertTask.value=true
  }
</script>