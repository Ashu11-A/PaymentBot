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
  const elapsedTime = (currentTime - startTime) / 1000 // Tempo decorrido desde o início da pesquisa
  const averageTimePerTable = elapsedTime / currentTable // Tempo médio por tabela (considerando todas as tabelas pesquisadas até agora)
  const remainingTables = totalTables - currentTable // Estimativa de término
  const estimatedTimeRemaining = remainingTables * averageTimePerTable

  return { progress: (currentTable / totalTables) * 100, estimatedTimeRemaining }
}
