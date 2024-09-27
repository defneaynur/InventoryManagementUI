<template>
  <v-container class="mt-5" fluid>
    <v-row justify="center">
      <v-col xs="12" sm="8" md="6" lg="4">
        <v-card>
          <v-card-title>
            <h2 class="text-center">Giriş Yap</h2>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="username"
                label="Kullanıcı Adı"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Şifre"
                type="password"
                required
              ></v-text-field>
              <v-btn type="submit" color="primary" class="w-100">Giriş Yap</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
    login() {
      const userCredentials = {
        UserName: this.username,
        Password: this.password
      };

      axios.post('https://localhost:7092/api/UserService/login', userCredentials)
        .then(response => {
          const data = response.data;
          if (data.responseCode === 1) {
            localStorage.setItem('token', data.data);
            localStorage.setItem('userName', userCredentials.UserName);
            
            this.$router.push('/admin');
          } else {
            alert('Giriş başarısız: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Login error:', error);
          alert('Giriş işlemi sırasında bir hata oluştu.');
        });
    }
  }
};
</script>

<style scoped>
.v-card {
  max-width: 400px;
  margin: auto;
}
</style>
