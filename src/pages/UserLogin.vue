<template>
    <div class="login-container">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin">
        <div>
          <label for="email">Email:</label>
          <input v-model="email" id="email" type="email" required />
        </div>
  
        <div>
          <label for="password">Password:</label>
          <input v-model="password" id="password" type="password" required />
        </div>
  
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const email = ref('');
  const password = ref('');
  
  // Placeholder login (will integrate with Sanctum later)
  const handleLogin = async () => {
    console.log('Logging in with:', { email: email.value, password: password.value });
    router.push('/');
  };
  </script>
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  
  form div {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 8px;
  }
  
  button {
    width: 100%;
    padding: 10px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  </style>
  