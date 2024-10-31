<template>
  <v-container>
    <div class="bg-grey text-center text-h4 ma-2 pa-2">Lista de Tarefas</div>
    <v-btn class="bg-blue ma-2" @click="insertTask=true" prepend-icon="mdi-plus-circle" variant="text">Adicionar Nova Tarefa</v-btn>
    <v-table class="ma-2">
      <thead class="bg-grey">
        <tr>
          <th class="text-left" v-for="item in tableHeaders" v-text="item" />
          <th colspan="2">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="task in tasks"
          :key="task.id"
          :class="{'bg-yellow-lighten-3': task.cost > 1000}"
        >
          <td>#{{ task.id }}</td>
          <td>{{ task.name }}</td>
          <td>R$ {{ task.cost }}</td>
          <td>{{ task.date }}</td>
          <td>
            <v-btn icon="mdi-pencil" variant="text"></v-btn>
            <v-btn icon="mdi-delete" @click="deletes(task.name, task.id)" variant="text" color="red"></v-btn>
          </td>
        </tr>
        <h3 v-if="!tasks.length" class="text-center">Não há tarefas cadastradas no momento</h3>
      </tbody>
    </v-table>
    <v-dialog v-model="insertTask" width="auto">
      <v-card max-width="auto">
      <v-card-title class="bg-grey text-center">Adicionar Nova Tarefa</v-card-title>
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
          class="bg-blue"
          text="Adicionar"
          block
          @click="addTask"
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
  import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';
  import { db } from '~/firebaseConfig';

  const tableHeaders = ref(['ID','Nome da Tarefa','Custo','Data Limite'])
  const deleteTaskDialog = ref(false)
  const insertTask = ref(false)
  const nameToDelete = ref("")
  const idDelete = ref("")
  const dataInsert = reactive({
    name: '',
    cost: '',
    date: ''
  })
  const errorInsert = ref('')
  const tasks = ref([])
  const deletes = ((name: string, id: string) => {
    nameToDelete.value = name
    idDelete.value = id
    deleteTaskDialog.value = true
  })

  const deleteTask = async () => {
    try {
      const taskRef = doc(db, "tarefas", idDelete.value); // Referência ao documento
      await deleteDoc(taskRef); // Deletar o documento
      deleteTaskDialog.value = false
      fetchAllData(); // Atualiza a lista de tarefas após a deleção
    } catch (error) {
      console.error("Erro ao deletar tarefa: ", error);
      errorInsert.value = "Erro ao deletar tarefa.";
    }
  }

  const verifyName = (async(name: string) => {
    if (!name || name.trim() === "") return true;
    const q = query(collection(db, "tarefas"), where("name", "==", name));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty
  })
  const addTask = async() => {
    const nameExists = await verifyName(dataInsert.name.trim())
    const q = query(collection(db, "tarefas"), orderBy("ordem", "desc"));
    const querySnapshot = await getDocs(q);
    
    // Definindo a nova ordem
    let novaOrdem = 1; // Padrão para a primeira tarefa
    if (!querySnapshot.empty) {
      const lastTask = querySnapshot.docs[0].data();
      novaOrdem = lastTask.ordem + 1; // Incrementa a ordem da última tarefa
    }
    try {
      if(!nameExists){
        errorInsert.value = ''
        await addDoc(collection(db, "tarefas"), {...dataInsert, ordem: novaOrdem});
        insertTask.value = false
        fetchAllData()
        dataInsert.name = ''
        dataInsert.cost = ''
        dataInsert.date = ''
      }else{
        errorInsert.value = 'Nome já existe não é possivel adicionar'
      }
    } catch (error) {
      console.error("Erro ao adicionar documento: ", error);
    }
  }

  const fetchAllData = async () => {
    try {
      const q = query(collection(db, "tarefas"), orderBy("ordem"));
      const querySnapshot = await getDocs(q)
      tasks.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar dados: ", error);
    }
  };

  onMounted(() =>{
    fetchAllData()
  })
</script>