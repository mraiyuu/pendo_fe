<template>
  <main class="dashboard" v-if="isAuthenticated">
    <!-- Header -->
    <header class="header">
      <h1>Your Tasks</h1>
      <button @click="logout" class="logout-btn">Logout</button>
    </header>

    <!-- Task List -->
    <section v-if="loading" class="loading">Loading tasks...</section>
    <section v-else-if="tasks.length" class="task-list">
      <div v-for="task in tasks" :key="task.task_id" class="task-card" @click="openEditModal(task)">
        <div class="task-content">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
        </div>
        <div class="task-footer">
          <span :class="statusClass(task)">Due {{ getStatus(task) }}</span>
          <button @click.stop="deleteTask(task.task_id)" class="delete-btn">
            <svg class="delete-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </section>
    <section v-else class="no-tasks">
      <p>No tasks found. Create your first task!</p>
    </section>

    <!-- Pagination -->
    <footer class="pagination" v-if="!loading && tasks.length">
      <button @click="prevPage" :disabled="page <= 1" class="page-btn">← Prev</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page >= totalPages" class="page-btn">Next →</button>
    </footer>

    <!-- Floating Add Task Button -->
    <button class="fab" @click="openCreateModal">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>

    <!-- Task Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editingTask ? 'Edit Task' : 'Create Task' }}</h2>
        <div class="form-group">
          <label>Task Title</label>
          <input v-model="taskForm.title" placeholder="Enter task title" required :class="{ 'input-error': errors.title }" />
          <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="taskForm.description" placeholder="Enter task description" :class="{ 'input-error': errors.description }"></textarea>
          <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
        </div>
        <div class="form-group">
          <label>Due Date</label>
          <input v-model="taskForm.due_date" type="date" required :class="{ 'input-error': errors.due_date }" />
          <span v-if="errors.due_date" class="error-message">{{ errors.due_date }}</span>
        </div>
        <div class="modal-actions">
          <button @click="submitTask" class="submit-btn">{{ editingTask ? 'Update' : 'Create' }}</button>
          <button @click="closeModal" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </main>

  <!-- Login Prompt if Not Authenticated -->
  <div v-else class="login-prompt">
    <h2>Please Log In</h2>
    <div class="login-actions">
      <button @click="navigateToLogin" class="login-btn">Login</button>
      <button @click="navigateToRegister" class="register-btn">Register Account</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchTasks, createTask, updateTask, deleteTask as apiDeleteTask } from '../api/task';
import { logoutUser, checkAuthentication, getToken } from '../api/auth';

// Router
const router = useRouter();

// State
const tasks = ref([]);
const loading = ref(false);
const page = ref(1);
const totalPages = ref(1);
const showModal = ref(false);
const editingTask = ref(null);
const taskForm = ref({ title: '', description: '', due_date: '' });
const isAuthenticated = ref(false);
const errors = ref({}); // To store validation errors

// Format date method
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Validate Task Form
const validateTaskForm = () => {
  const newErrors = {};

  // Validate title
  if (!taskForm.value.title || taskForm.value.title.trim().length === 0) {
    newErrors.title = 'Title is required';
  } else if (taskForm.value.title.trim().length < 3) {
    newErrors.title = 'Title must be at least 3 characters long';
  }

  // Validate description
  if (!taskForm.value.description || taskForm.value.description.trim().length === 0) {
    newErrors.description = 'Description is required';
  } else if (taskForm.value.description.trim().length < 5) {
    newErrors.description = 'Description must be at least 5 characters long';
  }

  // Validate due_date
  if (!taskForm.value.due_date) {
    newErrors.due_date = 'Due date is required';
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const dueDate = new Date(taskForm.value.due_date);
    if (dueDate < today) {
      newErrors.due_date = 'Due date must be today or in the future';
    }
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0; // Return true if no errors
};

// Authentication Check
const checkAuth = async () => {
  try {
    isAuthenticated.value = checkAuthentication();
    
    if (isAuthenticated.value) {
      await loadTasks();
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    isAuthenticated.value = false;
  }
};

// Navigation Methods
const navigateToLogin = () => {
  router.push('/login');
};

const navigateToRegister = () => {
  router.push('/register');
};

// Load Tasks
const loadTasks = async () => {
  loading.value = true;
  try {
    const token = getToken();
    
    // Configure axios to use the token
    const config = {
      headers: { 
        Authorization: `Bearer ${token}` 
      },
      params: {
        page: page.value,
        per_page: 5
      }
    };

    const response = await fetchTasks(config);
    
    tasks.value = response.tasks || [];
    totalPages.value = response.pagination?.total_pages || 1;
  } catch (error) {
    console.error('Error loading tasks:', error);
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      logout();
    }
  } finally {
    loading.value = false;
  }
};

// Open Modals
const openCreateModal = () => {
  editingTask.value = null;
  taskForm.value = { title: '', description: '', due_date: '' };
  errors.value = {}; // Clear errors when opening modal
  showModal.value = true;
};

const openEditModal = (task) => {
  editingTask.value = task;
  taskForm.value = { ...task };
  errors.value = {}; // Clear errors when opening modal
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  errors.value = {}; // Clear errors when closing modal
};

// Submit Task
const submitTask = async () => {
  // Validate the form
  if (!validateTaskForm()) {
    return; // Stop if validation fails
  }

  try {
    const token = getToken();
    const config = {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    };

    if (editingTask.value) {
      await updateTask(editingTask.value.task_id, taskForm.value, config);
    } else {
      await createTask(taskForm.value, config);
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
      const token = getToken();
      const config = {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      };

      await apiDeleteTask(taskId, config);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }
};

// Logout
const logout = async () => {
  await logoutUser();
  isAuthenticated.value = false;
  router.push('/login');
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
const getStatus = (task) => formatDate(task.due_date);
const statusClass = () => 'status';

// Init
onMounted(checkAuth);

// Watch for changes in authentication
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    loadTasks();
  }
});
</script>

<style scoped>
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Layout */
.dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 2rem;
  background: #f8fafc;
  color: #1e293b;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.logout-btn:hover {
  background: #dc2626;
}

/* Task List */
.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid #e2e8f0;
}

.task-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.task-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.task-content p {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
}

/* Task Footer */
.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status {
  font-size: 0.85rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-weight: 500;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
}

.delete-icon {
  width: 16px;
  height: 16px;
}

/* Pagination */
.pagination {
  margin-top: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination span {
  font-size: 1rem;
  color: #64748b;
}

.page-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.page-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: #2563eb;
}

/* Floating Add Button */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #1e293b;
  background: #f8fafc;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

/* Error Styling */
.input-error {
  border-color: #ef4444 !important;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.submit-btn,
.cancel-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-btn {
  background: #3b82f6;
  color: white;
  border: none;
}

.submit-btn:hover {
  background: #2563eb;
}

.cancel-btn {
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #f1f5f9;
}

/* No Tasks */
.no-tasks {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-size: 1.1rem;
}

/* Loading */
.loading {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-size: 1.1rem;
}

/* Login Prompt */
.login-prompt {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f8fafc;
}

.login-prompt h2 {
  color: #1e293b;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.login-actions {
  display: flex;
  gap: 1rem;
}

.login-btn,
.register-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-btn {
  background: #3b82f6;
  color: white;
  border: none;
}

.login-btn:hover {
  background: #2563eb;
}

.register-btn {
  background: #10b981;
  color: white;
  border: none;
}

.register-btn:hover {
  background: #059669;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .task-list {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 90%;
    padding: 1.5rem;
  }

  .fab {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .logout-btn {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }

  .page-btn {
    width: 100%;
  }
}
</style>