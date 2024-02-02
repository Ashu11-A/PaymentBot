export function validarValor (valor: string): [boolean, string] | [boolean] {
  if (valor === '') {
    return [false, '😑 | Você não pode definir o Preço como VAZIO, oque você esperava que ocorresse?']
  }
  // Primeiro, verifique se o valor corresponde ao formato de dinheiro usando uma expressão regular
  const regex = /^[0-9]+(\.[0-9]{1,2}|,[0-9]{1,2})?$/

  if (!regex.test(valor)) {
    // O valor não corresponde ao formato de dinheiro
    return [false, 'O valor expecificado não é válido. Deve conter apenas números inteiros ou com até duas casas decimais, separadas por vírgula ou ponto.\nEx: 12, 29,99 ou 34.50']
  }

  const valorNumerico = parseFloat(valor.replace(',', '.'))

  if (isNaN(valorNumerico)) {
    // Se a conversão resultar em NaN, o valor não é válido
    return [false, 'O valor expecificado não é válido']
  }

  // Finalmente, verifique se o valor não ultrapassa 9999
  if (valorNumerico > 9999) {
    return [false, 'O valor especificado não deve ser maior que 9999.']
  }

  // Se todas as verificações passaram, o valor é válido
  return [true]
}

export function validarCorHex (cor: string): [boolean, string] | [boolean] {
  if (cor === '') {
    return [false, '😒 | Você não pode definir a Cor como VAZIO, oque você esperava que ocorresse?']
  }
  // Expressão regular para verificar se a cor está no formato HEX válido
  const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/

  if (!regex.test(cor)) {
    return [false, 'A Cor expecificada não é valida!']
  }

  return [true]
}

export function validarEmail (email: string): [boolean, string] {
  // Expressão regular para validar o formato do email
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  // Testar o email em relação à expressão regular
  if (!regex.test(email)) {
    return [false, `❌ | "${email}" não é um e-mail válido. Por favor, informe um e-mail válido.`]
  } else {
    return [true, '']
  }
}

export function validarURL (url: string): [boolean, string] {
  try {
    const parsedURL = new URL(url)
    return [true, `${parsedURL.protocol}//${parsedURL.host}`]
  } catch {
    return [false, '']
  }
}
