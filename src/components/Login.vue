<template>
  <b-card>
    <b-row class="my-1">
      <b-col sm="3">
        <label for="username">Usuario:</label>
      </b-col>
      <b-col sm="9">
        <b-form-input v-model="username" id="username" :state="null"></b-form-input>
      </b-col>
    </b-row>
    <b-row class="my-1">
      <b-col sm="3">
        <label for="password">Constraseña:</label>
      </b-col>
      <b-col sm="9">
        <b-form-input v-model="password" id="password" :state="null" type="password"></b-form-input>
      </b-col>
    </b-row>
    <template v-slot:footer>
      <div class="text-right">
        <label v-if="error" class="badge badge-danger mr-2">{{ error }}</label>
        <b-button variant="primary" @click="login">Ingresar</b-button>
      </div>
    </template>
  </b-card>
</template>

<script>

export default {
  path: '/login',
  name: 'Login',
  props: {
    value: String,
  },
  data() {
    return {
      username: '',
      password: '',
      error: '',
    };
  },
  methods: {
    login() {
      this.error = '';
      window.axios.post('/proyectos/login' , {
        username: this.username,
        password: this.password,
      }).then((res) => {
        window.axios.defaults.headers.common = {
          "X-ClientLogin": res.data.token
        };
        this.$root.joinEcho(res.data);
        this.$emit('input', this.username);
        this.$emit('login', res.data);
      }).catch(err => {
        this.error = err.response && err.response.data && err.response.data.message || err.message;
      });
    },
  },
}
</script>

<style scoped>
</style>
