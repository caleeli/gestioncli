<template>
  <div>
    <login v-if="!username" v-model="username" @login="login" />
    <workspace v-else-if="!path" v-model="path" />
    <div v-else>
      <h4>Tareas</h4>
      <div v-for="issue in issues" :key="`issue-${issue.id}`" bg-variant="warning">
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
      </div>
    </div>
  </div>
</template>

<script>
import Echo from 'laravel-echo';

window.io = require('socket.io-client');
var watch = require('node-watch');
const fs = require("fs");

export default {
  path: '/',
  name: 'HelloWorld',
  props: {
    msg: String,
  },
  data() {
    return {
      dir: [],
      username: '',
      path: '',
      watcher: null,
      entregables: [],
      issues: [],
      uploadPath: '',
    };
  },
  methods: {
    login(login) {
      if (login.workspace) {
        this.path = login.workspace;
      }
    },
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
      window.axios.post( '/api/uploadfile',
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
      window.axios.post('/notificar', {
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
      if (!this.username) {
        return;
      }
      this.issues.splice(0);
      window.axios.get('/hello/' + this.username).then(res => {
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
    joinEcho(host, key) {
      window.Echo = new Echo({
          broadcaster: 'socket.io',
          host,
          key,
      });
    },
  },
  watch: {
    username() {
      this.loadIssues();
    },
    path(path) {
      this.watchPath(path);
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
