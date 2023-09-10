import colors from "colors";
import { getTimestamp } from "./getTimestamp";

const cores: any = colors;
interface ConsoleLogs {
	currentHour:string;
	color:string;
	controller:string;
	levelColor:string;
	message:string;
	Type:string;
}
export function Console(controller: string, message: string, color: string, Type:string) {

	const { currentHour } = getTimestamp();
	const ConsoleLog:ConsoleLogs = {
		currentHour,
		color,
		controller,
		levelColor: color,
		message,
		Type
	};
	MakeLog(ConsoleLog);
	// Atualize a função MakeLog para aplicar cores na mensagem
	function MakeLog(ConsoleLog: ConsoleLogs) {
		const { currentHour, color, controller, levelColor, message, Type } = ConsoleLog;
		const formattedController = cores[color](controller);
		const formattedLevel = cores[levelColor](Type);
		const formattedMessage = applyColorTags(message); // Aplicar cores à mensagem

		console.log(`| ${currentHour} | ${formattedController} - ${formattedLevel} | ${formattedMessage}`);
	}

	// Função para substituir os padrões de cor na mensagem
	function applyColorTags(message: string): string {
		const colorTagPattern = /\[([^\]]+)\]\.(\w+)/g;
		return message.replace(colorTagPattern, (_, text, color) => {
			const colorFunction = cores[color];
			if (colorFunction) {
				return colorFunction(text);
			} else {
				return text; // Retornar o texto original se a cor não for encontrada
			}
		});
	}
}