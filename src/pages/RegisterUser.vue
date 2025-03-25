<template>
  <div class="register-container">
    <h1>Register</h1>
    <form @submit.prevent="handleRegister">
      <div>
        <label for="email">Email:</label>
        <input 
          v-model="email" 
          id="email" 
          type="email" 
          required 
          @blur="validateEmail"
        />
        <p v-if="emailError" class="error-text">{{ emailError }}</p>
      </div>

      <div>
        <label for="password">Password:</label>
        <input 
          v-model="password" 
          id="password" 
          type="password" 
          required 
          @blur="validatePassword"
        />
        <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
      </div>

      <div>
        <label for="confirm_password">Confirm Password:</label>
        <input 
          v-model="confirm_password" 
          id="confirm_password" 
          type="password" 
          required 
          @blur="validateConfirmPassword"
        />
        <p v-if="confirmPasswordError" class="error-text">{{ confirmPasswordError }}</p>
      </div>

      <button 
        type="submit" 
        :disabled="!isFormValid || isSubmitting"
      >
        {{ isSubmitting ? 'Registering...' : 'Register' }}
      </button>
    </form>
    <Toaster />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '@/api/register';
import { toast } from 'vue-sonner';

const router = useRouter();
const email = ref('');
const password = ref('');
const confirm_password = ref('');
const isSubmitting = ref(false);

const emailError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailError.value = !emailRegex.test(email.value) 
    ? 'Please enter a valid email address' 
    : '';
};

const validatePassword = () => {
  passwordError.value = password.value.length < 8
    ? 'Password must be at least 8 characters long'
    : '';
};

const validateConfirmPassword = () => {
  confirmPasswordError.value = password.value !== confirm_password.value
    ? 'Passwords do not match' 
    : '';
};

const isFormValid = computed(() => {
  return email.value && 
         password.value && 
         confirm_password.value && 
         !emailError.value && 
         !passwordError.value && 
         !confirmPasswordError.value;
});

const handleRegister = async () => {
  // Validate all fields before submission
  validateEmail();
  validatePassword();
  validateConfirmPassword();

  if (!isFormValid.value) return;

  isSubmitting.value = true;

  try {
    await registerUser({
      email: email.value,
      password: password.value,
      confirm_password: confirm_password.value,
    });

    toast.success('Registration successful! Redirecting to login...');
    router.push('/login');
  } catch (error) {
    const errorMessage = error.errorMessage || 'Registration failed. Please try again.';
    toast.error(`Error: ${errorMessage}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.register-container {
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
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-text {
  color: red;
  font-size: 0.85em;
  margin-top: 5px;
}
</style>