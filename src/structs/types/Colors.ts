// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class color {
  static Random = (): number => parseInt(Math.floor(Math.random() * 16777215).toString(16), 16)
  static Green = parseInt('008000', 16)
  static Red = parseInt('FF0000', 16)
  static Blue = parseInt('0099FF', 16)
  static Yellow = parseInt('FFFF00', 16)
  static Pink = parseInt('FFC0CB', 16)
  static LimeGreen = parseInt('00FF00', 16)
  static Gold = parseInt('ffd700', 16)
  static Orange = parseInt('ffa500', 16)
}

export { color }
