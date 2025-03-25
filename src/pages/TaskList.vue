<template>
    <main>
      <h1 class="title">Task List</h1>
      
      <div v-if="loading">Loading tasks...</div>
      
      <div v-else>
        <div v-for="task in tasks" :key="task.id" :class="{'overdue': isOverdue(task)}" class="task-card">
          <h2>{{ task.title }}</h2>
          <p>{{ task.description }}</p>
          <p>Due: {{ task.due_date }}</p>
          <router-link :to="`/task/${task.id}`">View Details</router-link>
        </div>
      </div>
  
      <button @click="prevPage" :disabled="page <= 1">Previous</button>
      <button @click="nextPage" :disabled="page >= totalPages">Next</button>
    </main>
  </template>
  
  <script setup>
  import { onMounted, computed, ref } from 'vue';
  import { useTaskStore } from '../store/task';
  
  const taskStore = useTaskStore();
  const { tasks, totalTasks, loading, loadTasks } = taskStore;
  
  const page = ref(1);
  const perPage = 5;
  
  const totalPages = computed(() => Math.ceil(totalTasks / perPage));
  
  const isOverdue = (task) => new Date(task.due_date) < new Date();
  
  const loadPage = () => loadTasks({ page: page.value, per_page: perPage });
  
  const nextPage = () => {
    if (page.value < totalPages.value) {
      page.value++;
      loadPage();
    }
  };
  
  const prevPage = () => {
    if (page.value > 1) {
      page.value--;
      loadPage();
    }
  };
  
  onMounted(loadPage);
  </script>
  
  <style scoped>
  .task-card {
    border: 1px solid #ccc;
    padding: 1rem;
    margin: 0.5rem 0;
    border-radius: 8px;
  }
  .overdue {
    background-color: #ffcccc;
  }
  button {
    margin: 0.5rem;
  }
  </style>
  