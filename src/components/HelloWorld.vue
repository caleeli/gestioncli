<template>
  <b-card>
    <b-row class="my-1">
      <b-col sm="3">
        <label for="username">Usuario:</label>
      </b-col>
      <b-col sm="9">
        <b-form-input v-model="username" id="username" :state="null" placeholder="usuario"></b-form-input>
      </b-col>
    </b-row>
    <b-row class="my-1">
      <b-col sm="3">
        <label for="workspace">Directorio de trabajo:</label>
      </b-col>
      <b-col sm="9">
        <b-form-file
          v-model="file"
          :state="Boolean(file)"
          directory
          :placeholder="path"
          drop-placeholder="Drop file here..."
        ></b-form-file>
      </b-col>
    </b-row>
    <b-table striped hover :items="dir">
      <template v-slot:head(name)>
        <div class="text-nowrap">Nombre</div>
      </template>
      <template v-slot:head(time)>
        <div class="text-nowrap">Última modificación</div>
      </template>
      <template v-slot:cell(time)="row">
        {{ row.item.time | moment('from') }}
      </template>
    </b-table>
  </b-card>
</template>

<script>
import axios from 'axios';
import Echo from 'laravel-echo';
window.io = require('socket.io-client');
var watch = require('node-watch');
const fs = require("fs");

export default {
  name: 'HelloWorld',
  props: {
    msg: String,
  },
  data() {
    return {
      dir: [],
      username: 'usuario',
      file: null,
      path: '/home/david/Documentos/Proyecto',
      watcher: null,
    };
  },
  methods: {
    format (d) {
      return d;
    },
    watchPath(path) {
      if (!path) {
        return;
      }
      if (this.watcher) {
        this.watcher.close();
      }
      watch(path, { recursive: true }, (evt, name) => {
        this.dir.push({...this.fileInfo(name), evt});
      });
    },
    fileInfo(path) {
      let time;
      try {
        time = fs.statSync(path).mtime.getTime();
      } catch (e) {
        time = new Date().getTime();
      }
      return {
        name: path.substr(this.path.length),
        time,
      };
    },
  },
  watch: {
    file(file) {
      this.path = file.path;
    },
    path(path) {
      this.watchPath(path);
    },
    joinEcho(host, key) {
      window.Echo = new Echo({
          broadcaster: 'socket.io',
          host,
          key,
      });
    },
  },
  mounted() {
    this.watchPath(this.path);
    axios.get('http://localhost:8000/api/hello/' + this.username).then(res => {
      console.log(res.data);
    });
  },
}
</script>

<style scoped>
</style>
