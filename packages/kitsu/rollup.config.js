import babel from 'rollup-plugin-babel'
import minify from 'rollup-plugin-babel-minify'
import local from 'rollup-plugin-local-resolve'
import replace from 'rollup-plugin-replace'
import pkg from './package.json'

let external = [
  ...Object.keys(pkg.dependencies),
  'kitsu-core/node',
  'kitsu-core/legacy',
  'babel-runtime/regenerator',
  'babel-runtime/helpers/asyncToGenerator',
  'babel-runtime/helpers/slicedToArray',
  'babel-runtime/helpers/classCallCheck',
  'babel-runtime/helpers/createClass',
  'babel-runtime/helpers/typeof'
]

let globals = {
  'axios': 'axios',
  'kitsu-core/node': 'KitsuCore',
  'kitsu-core/legacy': 'KitsuCore',
  'babel-runtime/regenerator': '_regeneratorRuntime',
  'babel-runtime/helpers/asyncToGenerator': '_asyncToGenerator',
  'babel-runtime/helpers/slicedToArray': '_slicedToArray',
  'babel-runtime/helpers/classCallCheck': '_classCallCheck',
  'babel-runtime/helpers/createClass': '_createClass',
  'babel-runtime/helpers/typeof': '_typeof' // Legacy
}

let plugins = [
  minify({ comments: false, mangle: true }),
  local()
]
let pluginsMain = [
  babel({ exclude: [ '*.json', 'node_modules/**/*' ], runtimeHelpers: true }),
  ...plugins
]
let pluginsNode = [
  replace({ 'kitsu-core': 'kitsu-core/node' }),
  babel({
    babelrc: false,
    exclude: [ '*.json', 'node_modules/**/*' ],
    runtimeHelpers: true,
    presets: [ [ 'env', { targets: { node: 6 }, modules: false } ], 'stage-0' ],
    plugins: [ [ 'transform-runtime', { polyfill: false, regenerator: true } ]
    ]
  }),
  ...plugins
]
let pluginsLegacy = [
  replace({ 'kitsu-core': 'kitsu-core/legacy' }),
  babel({
    exclude: [ '*.json', 'node_modules/**/*' ],
    runtimeHelpers: true,
    presets: [ [ 'env', { targets: { browsers: [ 'last 10 years' ], node: 6 }, modules: false } ], 'stage-0' ]
  }),
  ...plugins
]

export default [
  {
    input: 'src/index.js',
    external,
    plugins: pluginsMain,
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        globals
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
        globals
      }
    ]
  },
  {
    // Node-only bundle
    input: 'src/index.js',
    external,
    plugins: pluginsNode,
    output: [
      {
        file: 'node/index.js',
        format: 'cjs',
        sourcemap: true,
        globals
      },
      {
        file: 'node/index.mjs',
        format: 'es',
        sourcemap: true,
        globals
      }
    ]
  },
  {
    // Legacy IE10+ bundle
    input: 'src/index.js',
    external,
    plugins: pluginsLegacy,
    output: {
      file: 'legacy/index.js',
      format: 'umd',
      name: 'Kitsu',
      sourcemap: true,
      globals
    }
  }
]
