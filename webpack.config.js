/** @desc Webpack configuration
 *  @since 2020.05.18, 12:00
 *  @changed 2020.07.21, 16:33
 */

const fs = require('fs')
const path = require('path')

const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WebpackBuildNotifierPlugin = require('webpack-build-notifier') // https://www.npmjs.com/package/webpack-build-notifier
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CreateFileWebpack = require('create-file-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// const UglifyJS = require('uglify-js')
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
// const WebpackFilePreprocessorPlugin = require('webpack-file-preprocessor-plugin')
const ExtractCssPlugin = require('mini-css-extract-plugin')

module.exports = (env, argv) => {

  const mode = argv.mode || 'production'
  const isDevServer = !!argv.host // (mode === 'none'); // (none = server) // Alternate method: !!argv.host
  const isBuild = !isDevServer
  const hotReload = isDevServer
  const cssHotReload = hotReload // Hot reload css for dev-server
  const isStats = !!argv.profile
  const isWatch = !!argv.watch
  const isDev = (/* isDevServer || */ mode === 'development')
  const isProd = !isDev // mode === 'production'
  const useDevTool = true // && (isDev || isDevServer) // Need server restart
  const minimizeBundles = false && isProd // To minimize production bundles
  const sourceMaps = true // To minimize production bundles
  // const extemeUglify = false // Use mangling (WARNING: May broke some code! Don't use without testing!)
  const DEBUG = true && (isDev || isDevServer)
  const rootPath = path.resolve(__dirname)
  const srcPath = path.resolve(__dirname, 'src')
  // const debugDataPath = path.resolve(__dirname, 'debug-data') // Debug-time data stubs
  const mixinsPath = path.resolve(srcPath, '!mixins')

  // Additional configuration params from `webpack.env.js` and `webpack.env.local.js`
  const webpackEnvFile = path.resolve(rootPath, 'webpack.env.js')
  const webpackEnvLocalFile = path.resolve(rootPath,'webpack.env.local.js')
  const webpackEnv = fs.existsSync(webpackEnvFile) && require(webpackEnvFile)
  const webpackEnvLocal = fs.existsSync(webpackEnvLocalFile) && require(webpackEnvLocalFile)
  // Merge parameters from config files and command line (eg `--env.DEMO=true`)
  env = Object.assign({}, webpackEnv, webpackEnvLocal, env)

  const THEME = env.THEME || 'default'
  const THEME_FILE = './themes/' + THEME // For including in `src/config/css.js`
  // Set process.env variables for using in included below `css` module.
  // Also see passing variables to source code below.
  process.env.THEME = THEME
  process.env.THEME_FILE = THEME_FILE

  // Project configuration
  const packageFile = path.resolve(rootPath, 'package')
  const pkgConfig = require(packageFile)

  // Project version, application title
  const {
    description,
    version,
    // name: projectName,
  } = pkgConfig

  // UNUSED: Generate time stamps...
  const dateStringFormat = 'yyyy.mm.dd HH:MM:ss'
  const dateTagFormat = 'yymmdd-HHMM'
  const now = new Date()
  const dateformat = require('dateformat') // NOTE: Useing pre-generated timestamps from `package.json`
  const timestamp = dateformat(now, dateStringFormat)
  const timetag = dateformat(now, dateTagFormat)
  // const buildTagFile = 'build-timetag.txt'
  // const buildTag = fs.existsSync(buildTagFile) && fs.readFileSync(buildTagFile, 'utf8') || timetag

  const CopyWebpackPluginOptions = {
    globOptions: {
      ignore: [
        // Temp files
        '**/*.tmp',
        '**/*.bak',
        '**/*.sw?',
        // Misc backup files
        '**/*_',
        '**/*~',
        '**/*UNUSED',
        // Auxilary files
        '**/*.diff',
        '**/*.orig',
      ],
    },
  }

  const htmlFilename = 'index.html'

  // Build profile params...
  const buildType = isDevServer ? 'server' : 'build'
  const buildMode = isProd ? 'prod' : 'dev'
  const buildModePostfix = isDev ? '-dev' : ''
  const buildFolder = buildType + buildModePostfix
  const buildPath = path.resolve(rootPath, buildFolder)

  const buildTag = [ // Construct general-purpose build tag
    'v.' + version,
    timetag,
    buildType,
    buildMode,
    THEME,
  ].join('-')

  const useHashes = false // NOTE: Not works with pseudo-dynamic bundles loading method (with hardcoded urls)
  const bundleName = ({ ext, name, dir } = {}) => (dir || 'js/') + (name || '[name]') + (useHashes && !isWatch && !isDevServer ? '-[contenthash:8]' : '') + (ext || '.js')

  const mirrorStaticFolders = false // NOTE: Mirror static folders structure (eg: `.../bootstrap/distr/...`)
  const staticFolderUrl = 'assets' // Relative to css folder

  const fileLoaderOptions = {
    // limit: 1, // Extract all resources
    // // Simple name (plain folder)
    // // name: (isDevServer || isDevServer) ? '[path][name].[ext]' : staticFolderUrl + '/[name]-[contenthash:8].[ext]',
    // name: (isDevServer || isDevServer) ? '[path][name].[ext]' : staticFolderUrl + '/[name]-[hash:8].[ext]',
    // Mirroring static files folders
    // publicPath: '..', // Root relative to 'css' folder
    name: (file) => {
      let name = file
      if (isDevServer /* || isDev */) {
        name = '[path][name].[ext]'
      }
      else if (mirrorStaticFolders) {
        if (name.startsWith(rootPath)) {
          name = name.substr(rootPath.length)
        }
        name = staticFolderUrl + name
          .replace(/\\/g, '/')
          // .replace(/^\//, '')
          .replace(/^\/node_modules/, '')
          .replace(/([^/]+)$/, '[name]-[hash:8].[ext]')
          // .replace(/([^/]+)$/, '[name].[ext]')
      }
      else {
        name = staticFolderUrl + '/[name]-[hash:8].[ext]'
      }
      return name
    },
  }

  const jsEntryFile = 'index.jsx' // js source

  const bundleFile = 'bundle.js'

  // Common used style variables
  const cssConfigFile = path.resolve(srcPath, 'config', 'css.js')
  const cssConfig = fs.existsSync(cssConfigFile) ? require(cssConfigFile) : {}

  const postcssPlugins = [
    require('postcss-flexbugs-fixes'),
    require('postcss-import'),
    require('postcss-mixins')({ // https://github.com/postcss/postcss-mixins
      mixinsDir: [
        mixinsPath,
      ],
    }),
    require('postcss-advanced-variables')({ // https://github.com/jonathantneal/postcss-advanced-variables
      // unresolved: 'warn', // 'ignore',
      variables: cssConfig,
    }),
    require('postcss-simple-vars'), // https://github.com/postcss/postcss-simple-vars
    require('postcss-color-function'), // https://github.com/postcss/postcss-color-function
    require('postcss-calc')(),
    require('postcss-nested-ancestors'), // https://github.com/toomuchdesign/postcss-nested-ancestors
    require('postcss-nested'),
    require('postcss-url')({
      url: 'rebase',
      // maxSize: 20,
      // url: 'rebase',
    }),
    require('autoprefixer')({
      flexbox: 'no-2009',
    }),
    minimizeBundles && require('postcss-csso'),
    require('postcss-reporter'),
  ].filter(x => x)

  const passParameters = { // Pass parameters to code (to js & pcss)
    rootPath,
    bodyBgColor: cssConfig.bodyBgColor,
    description,
    THEME,
    THEME_FILE,
    DEBUG,
    DEV_DEBUG: DEBUG && env.DEV_DEBUG, // Extra debug level (on developers' machine, usually from `webpack.env.local.js` or specific npm script command)
    // DEV_SERVER: DEBUG && env.DEV_SERVER, // Debug server
    isDevServer,
    isDev,
    isProd,
    isWatch,
    buildTag,
    timetag,
    timestamp,
    version,
  }

  // Stats waiting only json on output...
  const debugModes = [
    buildTag,
    // mode,
    // 'ip:' + myIP,
    isDevServer && 'DevServer',
    isWatch && 'Watch',
    isDev && 'Development',
    isProd && 'Production',
    useDevTool && 'DevTool',
    minimizeBundles && 'minimize',
    sourceMaps && 'sourceMaps',
    // extemeUglify && 'extemeUglify',
    DEBUG && 'DEBUG',
    THEME && 'theme:' + THEME,
  ].filter(x => x).join(' ')
  if (!isStats) {
    console.log('Building:', debugModes) // eslint-disable-line no-console
  }

  return {
    mode,
    devtool: useDevTool && 'source-map', // 'cheap-module-source-map',
    entry: path.resolve(srcPath, jsEntryFile),
    performance: { hints: false },
    watch: isWatch,
    watchOptions: {
      ignored: [
        'node_modules/**',
        'src/**/.*.sw?',
        'src/**/*.bak',
        'src/**/*_',
        'src/**/*~',
        'src/**/*UNUSED',
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    output: {
      path: buildPath,
      filename: bundleName(), // 'js/bundle.js',
    },
    devServer: {
      hot: hotReload,
      index: htmlFilename,
      // contentBase: buildPath,
      // watchContentBase: true,
      port: 8080,
      host: '0.0.0.0',
    },
    module: { rules: [
      { // JS
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        options: {
          // sourceRoot: '/',
          retainLines: true,
          cacheDirectory: true,
        },
      },
      { // css/postcss
        test: /\.(pcss)$/,
        // exclude: /node_modules/, // Some imports may be from `node_modules/...`
        use: [
          cssHotReload ? 'style-loader' : ExtractCssPlugin.loader, // Hot styles realoading for dev-server
          {
            loader: require.resolve('css-loader'),
            options: {
              sourceMap: sourceMaps,
            },
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              ident: 'postcss',
              sourceMap: sourceMaps,
              parser: require('postcss-scss'),
              plugins: () => postcssPlugins,
            },
          },
        ],
      },
      { // resources
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        // Using `url-loader` for library but `file-loader` for demo-server
        // due to incorrect webpack `publicPath` resolving for library.
        // See [How to ship assets?](https://github.com/webpack/webpack/issues/7353)
        // TODO: M.b. here exists the solution for store library assets outside js code?
        // loader: isDevServer ? require.resolve('file-loader') : require.resolve('url-loader'),
        loader: require.resolve('file-loader'),
        options: fileLoaderOptions,
      },
    ]},
    plugins: [
      !isDevServer && !isStats && new CleanWebpackPlugin({ // Cleanup before build
        cleanOnceBeforeBuildPatterns: [
          path.join(buildPath, '**/*'),
        ],
        exclude: ['.gitkeep'],
        beforeEmit: true,
        // verbose: true,
        // dry: false,
      }),
      new webpack.DefinePlugin({ // Pass constants to source code
        'process.env': Object.entries(passParameters).reduce((data, [key, val]) => {
          return { ...data, [key]: JSON.stringify(val) }
        }, {})
      }),
      !isDevServer && new CopyWebpackPlugin({ // Simply copies the files over
        patterns: [
          { from: 'favicon.ico', to: './' },
          { from: 'build-static', to: './', ...CopyWebpackPluginOptions },
        ].filter(x => x),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(rootPath, 'html', htmlFilename),
        filename: htmlFilename,
        cache: true,
        inject: true,
        // minimify: minimizeBundles,
        // title: appTitle, // Not using; see i18n-specific appTitle** variables above (passed to js code env)
        templateParameters: Object.assign({}, cssConfig, passParameters),
      }),
      !cssHotReload && new ExtractCssPlugin({ // Extract css
        filename: bundleName({ ext: '.css', dir: 'css/' }),
      }),
      isBuild && new CreateFileWebpack({ // Create build tag file
        path: buildPath,
        fileName: 'version.txt',
        content: buildTag,
      }),
      new WebpackBuildNotifierPlugin({
        // title, logo,
        suppressSuccess: true,
      }),
    ].filter(x => x),
    optimization: {
      // Minimize if not preprocess and minimize flags configured
      minimize: minimizeBundles,
      minimizer: [
        new UglifyJsPlugin({
          test: /\.js$/i,
          // parallel: 8,
          sourceMap: sourceMaps,
          uglifyOptions: {
            output: {
              comments: false,
              ie8: true
            },
            // https://github.com/mishoo/UglifyJS2#compress-options
          },
        }),
      ],
    },
    stats: {
      // Nice colored output
      colors: true,
    },
  }
}
