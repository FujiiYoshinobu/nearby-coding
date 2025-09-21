const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/webview/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dev-dist'),
    filename: 'webview.js',
    clean: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/webview/template.html',
      filename: 'index.html'
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dev-dist'),
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true
  },
  devtool: 'inline-source-map'
};