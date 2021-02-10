const path = require('path');
const { readdirSync, writeFileSync } = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { DefinePlugin } = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { v4: uuid } = require('uuid');

const ENTRY_FOLDER = 'src/client/components/';
const getEntries = () => {
  const entries = Object.fromEntries(
    readdirSync(ENTRY_FOLDER).map(filename => [
      filename.split('.')[0],
      path.resolve(__dirname, ENTRY_FOLDER + filename),
    ]),
  );
  entries.styles = ['./src/client/styles.scss'];
  entries.main = ['./src/client/main.ts'];

  return entries;
};

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const basename = `${isProduction ? '[contenthash]-' : ''}[name]`;
const revision = uuid();

class RevisionFilePlugin {
  apply(compiler) {
    compiler.hooks.done.tap('Write revision file', () => {
      writeFileSync('./build/REVISION', revision);
    });
  }
}

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: 'source-map',
  entry: getEntries,
  output: {
    filename: basename + '.js',
    path: path.resolve(__dirname, 'build/'),
    publicPath: '/assets/bundles/',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    splitChunks: {
      minChunks: 2,
      minSize: 100,
      chunks: 'all',
      name: 'core',
    },
    runtimeChunk: {
      name: 'core',
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: basename + '.css' }),
    new DefinePlugin({
      __REVISION__: JSON.stringify(revision),
      __IS_DEVELOPMENT__: JSON.stringify(isDevelopment),
      __BUILD_TIMESTAMP__: DefinePlugin.runtimeValue(() => `"${Date.now()}"`, true),
    }),
    new ForkTsCheckerWebpackPlugin(),
    isProduction && new RevisionFilePlugin(),
  ].filter(Boolean),

  module: {
    rules: [
      {
        test: /\.(t|j)s$/,
        include: [path.resolve(__dirname, 'src/client')],
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /src\/client\/styles.scss$/,
        include: [path.resolve(__dirname, 'src/client')],
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /.scss$/,
        include: [path.resolve(__dirname, 'src/client')],
        exclude: [path.resolve(__dirname, 'src/client/styles.scss')],
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
};
