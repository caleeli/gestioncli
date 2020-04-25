module.exports = {
  configureWebpack: {
    externals: {
      momentjs: "require('momentjs')",
    },
  },
  pluginOptions: {
    electronBuilder: {
      externals: ['momentjs']
    }
  }
}
