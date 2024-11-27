<template>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Ürün Yönetimi</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn outlined color="secondary" @click="handleLogin">Login</v-btn>
    </v-app-bar>
  </template>
  
  <script>
  export default {
    name: 'NavbarComponent',
    methods: {
      handleLogin() {
        this.$router.push({ name: 'loginPage' });
      
      },
      toggleSidebar(){
        this.$emit()
      }
    },
  };
  </script>
  
  <style scoped>
  </style>
  