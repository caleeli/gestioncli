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
          placeholder="Choose a file or drop it here..."
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
      username: '',
      file: null,
      path: null,
      watcher: null,
    };
  },
  methods: {
    format (d) {
      return d;
    },
    watchPath(path) {
      if (this.watcher) {
        this.watcher.close();
      }
      watch(path, { recursive: true }, function(evt, name) {
        console.log('%s changed.', name);
        this.dir.push(this.fileInfo(path));
      });
    },
    fileInfo(path) {
      let time;
      try {
        time = fs.statSync(path).mtime.getTime();
      } catch (e) {
        e;
      }
      return {
        name: path.substr(this.path.length),
        time,
      };
    },
    listPath(dir) {
      fs.readdir(dir, (err, files) => {
        this.dir = files.map(function (fileName) {
          let time;
          try {
            time = fs.statSync(dir + '/' + fileName).mtime.getTime();
          } catch (e) {
            e;
          }
          return {
            name: fileName,
            time,
          };
        })
        .sort(function (a, b) {
          return a.time - b.time; });
      });
    },
  },
  watch: {
    file(file) {
      this.path = file.path;
    },
    path(path) {
      this.watchPath(path);
      this.listPath(path);
    },
  },
  mounted() {
  },
}
</script>

<style scoped>
</style>
