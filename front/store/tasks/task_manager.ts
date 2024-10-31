import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { defineStore } from "pinia";
import { db } from "~/firebaseConfig";


export const useTaskStore = defineStore('taskManager',{
    state: () => ({
        tasks: []
    }),

    actions: {
        async add_task(data: object){
            const q = query(collection(db, "tarefas"), orderBy("ordem", "desc"));
            const querySnapshot = await getDocs(q);

            let novaOrdem = 1; 
            if (!querySnapshot.empty) {
            const lastTask = querySnapshot.docs[0].data();
            novaOrdem = lastTask.ordem + 1;
            }
            try {
                await addDoc(collection(db, "tarefas"), {...data, ordem: novaOrdem});
            }
            catch (error) {
                console.error("Erro ao adicionar documento: ", error);
            }
        },

        async get_all_tasks(){
            try {
                const q = query(collection(db, "tarefas"), orderBy("ordem"));
                const querySnapshot = await getDocs(q)
                this.tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error("Erro ao buscar dados: ", error);
            }
        },

        async delete_task(id: string){
            try {
                const taskRef = doc(db, "tarefas", id); 
                await deleteDoc(taskRef);
            } catch (error) {
                console.error("Erro ao deletar tarefa: ", error);
            }
        },

        async editTask(id: string, data){
            const docRef = doc(db, "tarefas", id); 
            try {
                await updateDoc(docRef, {
                    name: data.name,
                    cost: data.cost,
                    date: data.date
                });
            }
            catch (error) {
                console.error("Erro ao atualizar documento: ", error);
            }
        }

    }
})