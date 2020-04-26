<template>
  <b-card>
      <b-row class="my-1">
      <b-col sm="3">
        <label for="workspace">Selecciona tu carpeta de trabajo:</label>
      </b-col>
      <b-col sm="9">
        <b-form-file
          v-model="file"
          :state="Boolean(file)"
          directory
          :placeholder="path"
          drop-placeholder="Arrastra los archivos aqui..."
        ></b-form-file>
        <small>Esta carpeta será donde recibirás, almacenarás y de donde se enviarán tus archivos de trabajo</small>
      </b-col>
    </b-row>
    <template v-slot:footer>
      <div class="text-right">
        <b-button variant="primary" @click="aceptar">Aceptar</b-button>
      </div>
    </template>
  </b-card>
</template>

<script>
const {app} = require('electron').remote

const documents = app.getPath('documents')

export default {
  path: '/workspace',
  name: 'Workspace',
  props: {
    value: String,
  },
  data() {
    return {
      path: documents,
      file: null,
    };
  },
  methods: {
    aceptar() {
      this.$emit('input', this.path);
      window.axios.post('/proyectos/workspace', {
        workspace: this.path,
      });
    },
  },
  watch: {
    file(file) {
      this.path = file.path;
    },
  },
}
</script>

<style scoped>
</style>
