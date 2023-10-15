// Função para aguardar um determinado tempo em milissegundos
async function delay (ms: number): Promise<unknown> {
  return await new Promise(resolve => setTimeout(resolve, ms))
}
export { delay }

export function updateProgressAndEstimation (options: {
  totalTables: number
  currentTable: number
  startTime: number
}): {
    progress: number
    estimatedTimeRemaining: number
  } {
  const { currentTable, totalTables, startTime } = options
  const currentTime = Date.now()

  // Calcule o tempo decorrido desde o início da pesquisa
  const elapsedTime = (currentTime - startTime) / 1000

  // Calcule o tempo médio por tabela (considerando todas as tabelas pesquisadas até agora)
  const averageTimePerTable = elapsedTime / currentTable

  // Calcule a estimativa de término
  const remainingTables = totalTables - currentTable
  const estimatedTimeRemaining = remainingTables * averageTimePerTable

  /*
  console.log(`
  Tempo decorrido: ${elapsedTime}
  Tempo / Tabela: ${averageTimePerTable}
  estimativa: ${estimatedTimeRemaining}
  Faltam: ${remainingTables} tabelas
  `)
  */

  // Retorne o progresso e a estimativa
  return { progress: (currentTable / totalTables) * 100, estimatedTimeRemaining }
}
