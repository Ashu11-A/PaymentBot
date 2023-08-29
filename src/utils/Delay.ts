// Função para aguardar um determinado tempo em milissegundos
async function delay (ms: number): Promise<any> {
  return await new Promise(resolve => setTimeout(resolve, ms))
}
export { delay }
