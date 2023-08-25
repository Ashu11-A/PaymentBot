// Função para gerar um valor aleatório de 128 caracteres
const gen = (numero: number): string => {
  numero = numero ?? 128 // Define o valor padrão como '128' se não for fornecido nenhum valor ou se o valor fornecido for falsy
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  let valor = ''

  for (let i = 0; i < numero; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length)
    valor += caracteres.charAt(indiceAleatorio)
  }

  return valor
}

const gex = (numero: number): string => {
  numero = numero ?? 128 // Define o valor padrão como '128' se não for fornecido nenhum valor ou se o valor fornecido for falsy
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[]|:;<>,.?/~`'

  let valor = ''

  for (let i = 0; i < numero; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length)
    valor += caracteres.charAt(indiceAleatorio)
  }

  return valor
}

export { gen, gex }
