const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest')

module.exports = [
  {
    name: 'server',
    entry: './server/server.js',
    target: 'node',
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: 'server.js',
    },
    mode: 'development',
  },
  {
    mode: "development",
    entry: {
      index: './src/index.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Nuki App - JV',
        template: './src/index.html'
      }),
      // new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      //  clientsClaim: true,
      //  skipWaiting: true,
      // }),
      new WorkboxPlugin.InjectManifest({
        swSrc: './src/sw.js',
      }),
      new WebpackPwaManifest({
        name: 'Nuki App - Jens Vanderstraeten',
        short_name: 'Nuki App - JV',
        description: 'Simple app to monitor and control your Nuki Smart Lock',
        background_color: '#00FCAD',
        crossorigin: 'use-credentials', //can be null, use-credentials or anonymous
        publicPath: './',
        icons: [
          {
            src: path.resolve('./src/assets/logo512.png'),
            sizes: [48, 72, 96, 144, 168, 192, 229, 512] // multiple sizes
          },
          {
            src: path.resolve('./src/assets/logo.png'),
            size: '1024x1024' // you can also use the specifications pattern
          },
          {
            src: path.resolve('./src/assets/logo.png'),
            size: '1024x1024',
            purpose: 'maskable'
          }
        ]
      })
    ],
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
  }
];