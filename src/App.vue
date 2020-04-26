<template>
  <div class="app">
    <router-view ref="current"></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
html, body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 10pt;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background-color: #FFFF99;
}
.blink {
  animation: blink 1s linear infinite;
}
@keyframes blink{
  0%{opacity: 0;}
  50%{opacity: .5;}
  100%{opacity: 1;}
}
</style>
