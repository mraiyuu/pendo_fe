<template>
    <div class="task-details">
      <h1>Task Details</h1>
      <div v-if="task">
        <p><strong>Title:</strong> {{ task.title }}</p>
        <p><strong>Description:</strong> {{ task.description }}</p>
        <p><strong>Due Date:</strong> {{ task.due_date }}</p>
        <button @click="goBack">Back to Task List</button>
      </div>
      <p v-else>Loading task details...</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  
  const route = useRoute();
  const router = useRouter();
  const task = ref(null);
  
  // Simulate fetching task details (replace with API call later)
  const fetchTaskDetails = async () => {
    const mockTasks = [
      { id: 1, title: 'Sample Task 1', description: 'Task description here', due_date: '2025-04-01' },
      { id: 2, title: 'Sample Task 2', description: 'Another task detail', due_date: '2025-04-15' },
    ];
    task.value = mockTasks.find((t) => t.id === parseInt(route.params.id));
  };
  
  const goBack = () => {
    router.push('/');
  };
  
  onMounted(fetchTaskDetails);
  </script>
  
  <style scoped>
  .task-details {
    padding: 20px;
  }
  
  button {
    margin-top: 20px;
  }
  </style>
  