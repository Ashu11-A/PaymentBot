// import { type OutputOptions } from 'rollup'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import multi from '@rollup/plugin-multi-entry'
import tsConfigPaths from 'rollup-plugin-tsconfig-paths'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: ['dist/**/*.js', 'dist/**/*.json'],
  treeshake: true,
  output: [
    {
      freeze: false,
      sourcemap: false,
      compact: false,
      noConflict: true,
      format: 'cjs',
      dir: 'build',
      preserveModules: true,
      preserveModulesRoot: 'dist'
    }
    // {
    //   minifyInternalExports: true,
    //   inlineDynamicImports: true,
    //   dynamicImportInCjs: true,
    //   preserveModules: false,
    //   noConflict: true,
    //   sourcemap: true,
    //   esModule: true,
    //   compact: true,
    //   freeze: true,
    //   extend: true,
    //   strict: true,
    //   format: 'cjs',
    //   file: 'test.js',
    //   name: 'Ashu11-a',
    //   exports: 'auto'
    // }
  ]/* satisfies OutputOptions[] */,
  plugins: [
    tsConfigPaths({ tsConfigPath: './tsconfig.build.json' }),
    nodeResolve({ preferBuiltins: false, extensions: ['.mjs', '.js', '.json', '.node'], browser: false, allowExportsFolderMapping: false }),
    multi({ include: 'dist/lib', preserveModules: true }),
    commonjs({ exclude: ['node_modules/**/*.node'] }),
    // terser({
    //   maxWorkers: 4,
    //   format: {
    //     ascii_only: true,
    //     beautify: false,
    //     comments: false
    //   },
    //   mangle: true,
    //   module: true,
    //   toplevel: true,
    //   ie8: false,
    //   compress: true,
    //   parse: {
    //     bare_returns: true
    //   }
    // }),
    json(),
    nodePolyfills()
  ]
}
