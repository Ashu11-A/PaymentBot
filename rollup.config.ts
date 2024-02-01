import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser' // Compactar com terser
import typescript from '@rollup/plugin-typescript' // Conseguir ler esse arquivo
import multi from '@rollup/plugin-multi-entry' // Add multiplos arquivos
import nodePolyfills from 'rollup-plugin-polyfill-node'
import tsConfigPaths from 'rollup-plugin-tsconfig-paths'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: ['dist/lib/**/*.js', 'dist/lib/**/*.json'],
  treeshake: true,
  output: {
    // freeze: true,
    compact: true,
    // minifyInternalExports: true,
    // inlineDynamicImports: true,
    // noConflict: true,
    file: 'test.js',
    format: 'cjs',
    // sourcemap: true,
    extend: true,
    name: 'Ashu11-a'
    // esModule: true
  },
  plugins: [typescript({
    tsconfig: 'tsconfig.build.json'
  }), nodeResolve(), multi(), commonjs(), terser({ maxWorkers: 4 }), json(), nodePolyfills()]
}
