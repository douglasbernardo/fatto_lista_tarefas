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
            const novaOrdem = await this.get_new_order()
            await this.validateFields(data)
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
            const [day, month, year] = date.split('/').map(part => parseInt(part,10))
            const dateObj = new Date(year, month - 1, day);
            if (
                dateObj.getFullYear() !== year ||
                dateObj.getMonth() + 1 !== month ||
                dateObj.getDate() !== day
            ) {
                return { isValid: false, message: 'Data inválida!' };
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

        async editTask(id: string, data: {name: string, cost: string, date: string}){
            try {
                const q = query(collection(db, "tarefas"), where("name", "==", data.name.trim()));
                const querySnapshot = await getDocs(q);
                if(!querySnapshot.docs.some(doc => doc.id !== id)){
                    data.cost = typeof data.cost === "string" ? data.cost.replace(',', '.') : data.cost;
                    if (isNaN(data.cost) || data.cost < 0) {
                        this.errorMessages.push('Campo Custo é inválido');
                        return;
                    }
                    const validDate = await this.is_date_valid(data.date);
                    if (!validDate.isValid) {
                        this.errorMessages.push(validDate.message);
                        return;
                    }
                    const docRef = doc(db, "tarefas", id); 
                    await updateDoc(docRef, {
                        name: data.name,
                        cost: data.cost,
                        date: data.date
                    });
                    this.get_all_tasks()
                    this.errorMessages = []
                }else{
                    this.errorMessages.push('Tarefa já existente, escolha outro nome!')
                }
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

        async validateFields(value: {name: string, cost: number, date: string}){
            if (!value.name || !value.cost || !value.date) {
                this.errorMessages.push('Preencha todos os dados.');
                return false;
            }            

            if (await this.verifyName(value.name.trim())) {
                this.errorMessages.push('Essa Tarefa já existe! Escolha outro nome.');
                return false;
            }

            value.cost = typeof value.cost === "string" ? value.cost.replace(',', '.') : value.cost;
            if (isNaN(value.cost) || value.cost < 0) {
                this.errorMessages.push('Campo Custo é inválido');
                return false;
            }

            return true
        }
    }
})