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
    <h3>Tareas</h3>
    <b-card v-for="issue in issues" :key="`issue-${issue.id}`" bg-variant="warning">
      <div class="d-flex">
        <div class="mr-2">
          <div class="badge badge-light">
            {{ issue.status }}
          </div>
        </div>
        <div class="flex-grow-1">
          {{ issue.name }}
          <div v-if="issue.meta.entregable" class="badge badge-light">
            <i class="far fa-hdd"></i>
            {{ issue.meta.entregable }}
          </div>
        </div>
        <b-button v-if="issue.meta.entregable && issue.status!=='revision'"

          variant="success"
          size="sm"
          @click="subirArchivo(issue, issue.meta.entregable)">
          Subir archivo
        </b-button>
        <b-button v-if="issue.status==='revision'"
          variant="success"
          size="sm"
          @click="aceptarTarea(issue)">
          Aceptar
        </b-button>
        <b-button v-if="issue.status==='revision'"
          variant="danger"
          size="sm"
          @click="rechazarTarea(issue)">
          Rechazar
        </b-button>
      </div>
    </b-card>
    <h3>Registro</h3>
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
import axios0 from 'axios';
import Echo from 'laravel-echo';
window.io = require('socket.io-client');
var watch = require('node-watch');
const fs = require("fs");
const axios = axios0.create({
  baseURL: 'http://localhost:8000',
});

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
      entregables: [],
      issues: [],
      uploadPath: '',
    };
  },
  methods: {
    aceptarTarea(issue) {
      this.notificar('aceptar', issue, {});
    },
    rechazarTarea(issue) {
      this.notificar('rechazar', issue, {});
    },
    subirArchivo(issue, file) {
      const path = this.path + '/' + file;
      const buffer = fs.readFileSync(path);
      console.log(buffer);
      let formData = new FormData();
      formData.append('file', new File([buffer.toString()], path));
      axios.post( '/api/uploadfile',
        formData,
        {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
        }
      ).then((upload) => {
        this.notificar('upload', issue, upload.data);
      })
      .catch((err) => {
        console.log('FAILURE!!', err);
      });
    },
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
        const file = {...this.fileInfo(name), evt};
        const entregable = this.entregables.find(e => e.entregable === file.name);
        if (entregable) {
          this.notificar('change', entregable.issue, file);
        }
        this.dir.push(file);
      });
    },
    notificar(type, issue, data) {
      axios.post('/api/notificar', {
        type,
        issue,
        data,
      }).then((res) => {
        console.log(res);
        this.loadIssues();
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
        name: path.substr(this.path.length + 1),
        path,
        time,
      };
    },
    loadIssues() {
      this.issues.splice(0);
      axios.get('/api/hello/' + this.username).then(res => {
        res.data.issues.forEach(issue => {
          this.issues.push(issue);
          if (issue.status==='pendiente' || issue.status==='progreso') {
            if (issue.meta.entregable) {
              this.entregables.push({
                entregable: issue.meta.entregable,
                issue,
              });
            }
          }
        });
      });
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
    this.loadIssues();
    window.$vm0 = this;
  },
}
</script>

<style scoped>
</style>
