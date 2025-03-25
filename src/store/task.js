import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchTasks } from '../api/task';

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([]);
  const totalTasks = ref(0);
  const loading = ref(false);

  const loadTasks = async (params = {}) => {
    try {
      loading.value = true;
      const { data, total } = await fetchTasks(params);
      tasks.value = data;
      totalTasks.value = total;
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      loading.value = false;
    }
  };

  return { tasks, totalTasks, loading, loadTasks };
});
