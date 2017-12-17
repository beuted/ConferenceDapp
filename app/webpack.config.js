var webpack = require("webpack");
var path = require("path");
const build = path.resolve(__dirname, "build");

module.exports = {
  entry: "./src/app.js",
  output: {
    filename: "bundle.js",
    path: build
  },
  module: {
    rules: [],
    loaders: [
      {
        test: /\.json$/,
        use: "json-loader"
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ],
  devServer: {
    contentBase: build
  }
}