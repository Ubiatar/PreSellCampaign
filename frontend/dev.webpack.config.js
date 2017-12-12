/**
 * Created by AntonioGiordano on 04/01/16.
 */

const webpack = require('webpack')
const path = require('path')

module.exports = {
  entry: {
    'presell': './src/injector.jsx'
  },
  output: {
    path: path.join(__dirname, 'webroot'),
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'react', 'stage-2']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/^(net|dns)$/, path.resolve(__dirname, './shim.js'), path.resolve(__dirname, '../../node_modules'))
  ]
}
