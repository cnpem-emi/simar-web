var fs = require('fs');

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/simar/' : '/',

  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = "SIMAR";
        return args;
      })
  },
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    https: process.env.NODE_ENV === "development" ? {
      key: fs.readFileSync('./sim.key'),
      cert: fs.readFileSync('./sim.crt'),
    } : undefined,
    port: 8085,
  },
  configureWebpack: {
    optimization: {
    splitChunks: {
            minSize: 10000,
            maxSize: 250000,
        }
  }}
};