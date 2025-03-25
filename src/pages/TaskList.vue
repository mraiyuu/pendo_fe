<template>
  <main class="dashboard">
    <!-- Header -->
    <header class="header">
      <h1>Your Tasks</h1>
      <button @click="logout" class="logout-btn">Logout</button>
    </header>

    <!-- Task List -->
    <section v-if="loading" class="loading">Loading tasks...</section>
    <section v-else class="task-list">
      <div v-for="task in tasks" :key="task.task_id" class="task-card" @click="openEditModal(task)">
        <div class="task-content">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
        </div>
        <div class="task-footer">
          <span :class="statusClass(task)">{{ getStatus(task) }}</span>
          <button @click.stop="deleteTask(task.task_id)" class="delete-btn">🗑️ Delete</button>
        </div>
      </div>
    </section>

    <!-- Pagination -->
    <footer class="pagination" v-if="!loading">
      <button @click="prevPage" :disabled="page <= 1" class="page-btn">← Prev</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page >= totalPages" class="page-btn">Next →</button>
    </footer>

    <!-- Floating Add Task Button -->
    <button class="fab" @click="openCreateModal">+</button>

    <!-- Task Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editingTask ? 'Edit Task' : 'Create Task' }}</h2>
        <div class="form-group">
          <label>Task Title</label>
          <input v-model="taskForm.title" placeholder="Enter task title" required />
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="taskForm.description" placeholder="Enter task description"></textarea>
        </div>
        <div class="form-group">
          <label>Due Date</label>
          <input v-model="taskForm.due_date" type="date" required />
        </div>
        <div class="modal-actions">
          <button @click="submitTask" class="submit-btn">{{ editingTask ? 'Update' : 'Create' }}</button>
          <button @click="closeModal" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchTasks, createTask, updateTask, deleteTask as apiDeleteTask } from '../api/task';
import { logoutUser } from '../api/auth';

// State
const tasks = ref([]);
const loading = ref(false);
const page = ref(1);
const totalPages = ref(1);
const showModal = ref(false);
const editingTask = ref(null);
const taskForm = ref({ title: '', description: '', due_date: '' });

// Load Tasks
const loadTasks = async () => {
  loading.value = true;
  try {
    const { tasks: fetchedTasks, pagination } = await fetchTasks({ page: page.value, per_page: 5 });
    tasks.value = fetchedTasks;
    totalPages.value = pagination.total_pages;
  } catch (error) {
    console.error('Error loading tasks:', error);
  } finally {
    loading.value = false;
  }
};

// Open Modals
const openCreateModal = () => {
  editingTask.value = null;
  taskForm.value = { title: '', description: '', due_date: '' };
  showModal.value = true;
};
const openEditModal = (task) => {
  editingTask.value = task;
  taskForm.value = { ...task };
  showModal.value = true;
};
const closeModal = () => {
  showModal.value = false;
};

// Submit Task
const submitTask = async () => {
  try {
    if (editingTask.value) {
      await updateTask(editingTask.value.task_id, taskForm.value);
    } else {
      await createTask(taskForm.value);
    }
    closeModal();
    loadTasks();
  } catch (error) {
    console.error('Error saving task:', error);
  }
};

// Delete Task
const deleteTask = async (taskId) => {
  if (confirm('Delete this task?')) {
    try {
      await apiDeleteTask(taskId);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }
};

// Logout
const logout = async () => {
  await logoutUser();
  window.location.href = '/login';
};

// Pagination
const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++;
    loadTasks();
  }
};
const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    loadTasks();
  }
};

// Task Status
const getStatus = (task) => (new Date(task.due_date) < new Date() ? 'Overdue' : 'In Progress');
const statusClass = (task) => (new Date(task.due_date) < new Date() ? 'status overdue' : 'status');

// Init
onMounted(loadTasks);
</script>

<style scoped>
/* Layout */
.dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 2rem;
  background: #f9fafb;
  color: #333;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.logout-btn {
  background: #ff4757;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

/* Task List */
.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
.task-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
}
.task-card:hover {
  transform: translateY(-5px);
}

/* Task Footer */
.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.delete-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-btn:hover {
  background: #e63946;
}
.status {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}
.overdue {
  background: #ff6b6b;
  color: white;
}

/* Pagination */
.pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.page-btn {
  background: #1e90ff;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

/* Floating Add Button */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #1e90ff;
  color: white;
  font-size: 2rem;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 400px;
}
.form-group {
  margin-bottom: 1rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
