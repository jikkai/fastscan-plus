import { eslint } from 'rollup-plugin-eslint'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import { uglify } from 'rollup-plugin-uglify'

import pkg from './package.json'

const config = {
  input: './src/index.js',
  output: [{
    file: pkg.main,
    format: 'cjs'
  }, {
    file: pkg.main.replace('.cjs', '.umd'),
    format: 'umd',
    name: 'FastscanPlus',
    exports: 'named'
  }],
  context: 'window',
  plugins: [
    eslint({
      include: './src/**/*.js'
    }),
    resolve(),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.APP_VERSION': JSON.stringify(pkg.version)
    }),
    babel({
      externalHelpers: true
    }),
    uglify()
  ]
}

export default config
