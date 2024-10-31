import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { defineStore } from "pinia";
import { db } from "~/firebaseConfig";


export const useTaskStore = defineStore('taskManager',{
    state: () => ({
        tasks: []
    }),

    actions: {
        async get_all_tasks(){
            try {
                const q = query(collection(db, "tarefas"), orderBy("ordem"));
                const querySnapshot = await getDocs(q)
                this.tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error("Erro ao buscar dados: ", error);
            }
        }
    }
})