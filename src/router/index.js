// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import TaskList from '../pages/TaskList.vue';
import TaskDetails from '../pages/TaskDetails.vue';
import UserLogin from '../pages/UserLogin.vue';

const routes = [
  { path: '/', component: TaskList },
  { path: '/task/:id', component: TaskDetails },
  { path: '/login', component: UserLogin },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
