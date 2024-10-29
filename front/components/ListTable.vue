<template>
  <v-container>
    <div class="bg-grey text-center text-h4 ma-2 pa-2">Lista de Tarefas</div>
    <v-btn class="bg-blue ma-2" prepend-icon="mdi-plus-circle" variant="text">Adicionar Nova Tarefa</v-btn>
    <v-table class="ma-2">
      <thead class="bg-grey">
        <tr>
          <th class="text-left" v-for="item in tableHeaders" v-text="item" />
          <th colspan="2">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in desserts"
          :key="item.name"
          :class="{'bg-yellow-lighten-3': item.cost > 1000}"
        >
          <td>#{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>R$ {{ item.cost }}</td>
          <td>{{ item.limitDate }}</td>
          <td>
            <v-btn icon="mdi-pencil" variant="text"></v-btn>
            <v-btn icon="mdi-delete" @click="deletes(item.name)" variant="text" color="red"></v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-dialog v-model="deleteTaskDialog" width="auto">
      <v-card max-width="auto">
      <v-card-title>Deletar Tarefa: {{ nameToDelete }}</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
        class="bg-red"
          text="Deletar"
          @click=""
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
  const tableHeaders = ref(['id','Nome da Tarefa','Custo','Data Limite'])
  const deleteTaskDialog = ref(false)
  const nameToDelete = ref("")
  const deletes = ((name: string) => {
    nameToDelete.value = name
    deleteTaskDialog.value = true
  })
  const desserts = ref([
    {
        id: 1,
        name: 'Criar um sistema',
        cost: 14000,
        limitDate: '14/10/2025'
    },
    {
        id: 2,
        name: 'Criar um pdf',
        cost: 70,
        limitDate: '11/10/2024'
    },
    {
        id: 2,
        name: 'Criar um TCC',
        cost: 1370,
        limitDate: '20/11/2024'
    }
  ])
</script>