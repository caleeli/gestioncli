<template>
  <div>
    <login v-if="!username" v-model="username" @login="login" />
    <workspace v-else-if="!path" v-model="path" />
    <div v-else>
      <div class="border-bottom mb-2 p-2 d-flex justify-content-between align-items-center">
        <div>
          <b-button variant="warning">MIS TAREAS</b-button>
          <b-button :href="$root.home" target="_blank" variant="outline-info">VER TODAS</b-button>
        </div>
        <div>
          <b-button size="sm" variant="outline-secondary" @click="loadIssues">
            <font-awesome-icon icon="sync" :spin="loadingIssues" />
          </b-button>
        </div>
      </div>
      <div v-for="issue in issues" :key="`issue-${issue.id}`" bg-variant="warning">
        <div class="d-flex mb-1">
          <div class="flex-grow-1">
            <b-button class="border border-dark"
              :class="{'text-transparent': estaPendiente(issue)}"
              :disabled="!estaPendiente(issue)"
              size="sm" variant="light" @click="completeIssue(issue)"
            >
              <font-awesome-icon icon="check" />
            </b-button>
            {{ issue.name }}
            <div class="badge badge-light">
              {{ issue.status }}
            </div>
          </div>
          <div class="align-self-center">
            <label v-if="issue.meta.entregable" class="badge badge-light" :title="archivo(issue).title">
              <font-awesome-icon v-bind="archivo(issue)" />
              {{ issue.meta.entregable }}
            </label>
          </div>
          <!--
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
          -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
var watch = require('node-watch');
const fs = require("fs");
const path = require("path");

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
      loadingIssues: false,
      issues: [],
      uploadPath: '',
      uploading: [],
    };
  },
  methods: {
    IssuesUpdated() {
      this.loadIssues();
    },
    ///
    archivo(issue) {
      if (this.uploading.includes(issue.meta.entregable)) {
        return { icon: "upload", class: "blink", title: "Archivo esta siendo enviado..." };
      }
      if (issue.meta.entregable_upload) {
        return { icon: "share-alt", title: "Archivo fue enviado correctamente" };
      }
      const path = this.getWorkingPath(issue.meta.entregable);
      if (fs.existsSync(path)) {
        return { icon: "hdd", title: "Archivo encontrado en el directorio de trabajo" };
      } else {
        return { icon: "exclamation-circle", title: "Archivo no se enceuntra en el directorio de trabajo" };
      }
    },
    estaPendiente(issue) {
      return issue.status==='pendiente' || issue.status==='progreso';
    },
    completeIssue(issue) {
      const inicial = issue.status;
      issue.status = issue.status === 'pendiente' || issue.status === 'progreso' ? 'revision' : issue.status;
      if (issue.meta.entregable) {
        if (confirm('Al completar la tarea se enviará el archivo requerido.\n\n'
          + this.getWorkingPath(issue.meta.entregable)
          +'\n\n¿Desea continuar?')) {
          if (!this.subirArchivo(issue, issue.meta.entregable)) {
            alert(
              'No se puede completar la tarea, esta tarea require el archivo: \n\n'
              + this.getWorkingPath(issue.meta.entregable)
            );
            issue.status = inicial;
          }
        }
      } else {
        this.completarTarea(issue);
      }
    },
    login(login) {
      if (login.workspace) {
        this.path = login.workspace;
      }
    },
    completarTarea(issue) {
      this.notificar('completar', issue, {});
    },
    aceptarTarea(issue) {
      this.notificar('aceptar', issue, {});
    },
    rechazarTarea(issue) {
      this.notificar('rechazar', issue, {});
    },
    getWorkingPath(file) {
      return path.join(this.path, file);
    },
    subirArchivo(issue, file) {
      const path = this.getWorkingPath(file);
      if (!fs.existsSync(path)) {
        return false;
      }
      const buffer = fs.readFileSync(path);
      const content = new Uint8Array(buffer);
      let formData = new FormData();
      formData.append("file", new Blob([content]), file);
      this.uploading.push(file);
      window.axios.post( '/uploadfile',
        formData,
        {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
        }
      ).then((upload) => {
        this.uploading = this.uploading.filter(f => f !== file);
        this.notificar('upload', issue, upload.data);
      })
      .catch((err) => {
        this.uploading = this.uploading.filter(f => f !== file);
        console.log('FAILURE!!', err);
      });
      return true;
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
      }).then(() => {
        // se esperara a refresh del socket.
        // this.loadIssues();
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
      this.loadingIssues = true;
      window.axios.get('/hello/' + this.username).then(res => {
        this.issues.splice(0);
        this.loadingIssues = false;
        res.data.issues.forEach(issue => {
          issue.completed = issue.status !== 'pendiente';
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
      }).catch(() => {
        this.loadingIssues = false;
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
.text-transparent {
  color: transparent;
}
</style>
