import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import path from 'path'
import { minify } from 'terser'

async function carregarDados (options: {
  diretorio: string
}): Promise<Record<string, string>> {
  const { diretorio } = options
  const files: Record<string, string> = {}

  function scanDirectory (diretorio: string): void {
    readdirSync(diretorio).forEach((file) => {
      const fullPath = path.join(diretorio, file)

      if (lstatSync(fullPath).isDirectory()) {
        scanDirectory(fullPath)
      } else if (path.extname(fullPath) === '.js' || path.extname(fullPath) === '.json') {
        const code = readFileSync(fullPath, 'utf8')
        files[fullPath] = code
      }
    })
  }
  scanDirectory(diretorio)

  return files
}

async function compress (): Promise<void> {
  const files = await carregarDados({ diretorio: 'dist' })
  for (const [filePath, fileContent] of Object.entries(files)) {
    const newPath = path.dirname(filePath).replace('dist', 'build')
    const fileName = path.basename(filePath)
    const fileExt = path.extname(filePath)
    if (!existsSync(newPath)) { mkdirSync(newPath, { recursive: true }) }

    if (fileExt === '.js') {
      await minify({ [filePath]: fileContent }, {
        compress: {
          unsafe: true,
          unsafe_arrows: true,
          unsafe_comps: true,
          unsafe_Function: true,
          unsafe_math: true,
          unsafe_methods: true,
          unsafe_proto: true,
          unsafe_regexp: true,
          unsafe_symbols: true,
          unsafe_undefined: true
        },
        parse: {
          bare_returns: true
        },
        ie8: false,
        keep_fnames: false,
        mangle: true,
        module: true,
        toplevel: true,
        output: {
          ascii_only: true,
          beautify: false,
          comments: false
        },
        sourceMap: true
      })
        .then((result) => {
          if (typeof result.code !== 'string') return
          writeFileSync(`${newPath}/${fileName}`, result.code, 'utf8')
        })
        .catch((err) => {
          console.log(`Não foi possivel comprimir o arquivo: ${filePath}`)
          console.error(err)
        })
    } else {
      writeFileSync(`${newPath}/${fileName}`, fileContent, 'utf8')
    }
  }
}

void compress()
