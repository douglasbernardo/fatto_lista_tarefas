import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { defineStore } from "pinia";
import { db } from "../../firebaseConfig";


export const useTaskStore = defineStore('taskManager',{
    state: () => ({
        tasks: [],
        errorMessages: []
    }),

    actions: {
        async add_task(data: {name: string, cost: string, date: string}) {
            const novaOrdem = await this.get_new_order();

            if (!data.name || !data.cost || !data.date) {
                this.errorMessages.push('Preencha todos os dados.');
                return;
            }            

            if (await this.verifyName(data.name.trim())) {
                this.errorMessages.push('Essa Tarefa já existe! Escolha outro nome.');
                return;
            }

            if (!Number(data.cost)) {
                this.errorMessages.push('Campo Custo deve ser um valor numerico');
                return;
            }
        
        
            const validDate = await this.is_date_valid(data.date);
            if (!validDate.isValid) {
                this.errorMessages.push(validDate.message);
                return;
            }
            try {
                await addDoc(collection(db, "tarefas"), { ...data, ordem: novaOrdem });
                this.get_all_tasks()
                this.errorMessages = []
            } catch (error) {
                console.error("Erro ao adicionar documento: ", error);
            }
        },
        async get_new_order() {
            const q = query(collection(db, "tarefas"), orderBy("ordem", "desc"));
            const querySnapshot = await getDocs(q);
        
            return querySnapshot.empty ? 1 : querySnapshot.docs[0].data().ordem + 1;
        },
        
        async is_date_valid(date: string) {
            const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
            if (!regex.test(date)) {
                return { isValid: false, message: 'Essa não é uma data válida! O formato deve ser DIA/MÊS/ANO.' };
            }
        
            const year = parseInt(date.split('/')[2], 10);
            const currentYear = new Date().getFullYear();

            const month = parseInt(date.split('/')[1])
            const currentMonth = new Date().getMonth() + 1

            const day = parseInt(date.split('/')[0],10)
            const currentDay = new Date().getDate()
            
            if (year < currentYear) {
                return { isValid: false, message: 'O ano não pode ser menor que o atual!' };
            }else if(year === currentYear){
                if(month < currentMonth){
                    return { isValid: false, message: 'O mës não pode ser menor que o atual!' };
                }
                else if(month === currentMonth && day < currentDay){
                    return { isValid: false, message: 'O dia não pode ser menor que o atual!' };
                }
            }
            return { isValid: true, message: '' };
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
                this.get_all_tasks()
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
                this.get_all_tasks()
            }
            catch (error) {
                console.error("Erro ao atualizar documento: ", error);
            }
        },

        async verifyName(name: string) {
            if (!name || name.trim() === "") return true;
            const q = query(collection(db, "tarefas"), where("name", "==", name));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty
        },
    }
})