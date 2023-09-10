import { logs } from "controllers/loggings/logs";
import { loggings } from "controllers/loggings/params";

const logHistory: any = {}; // armazena o histórico de mensagens

const core = (message: string) => logs("Loggings", message, "Warn", "green");

export function CheckColors(color: string, type: string) {

	const validColors = ["strip", "stripColors", "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "gray", "grey",
		"bgBlack", "bgRed", "bgGreen", "bgYellow", "bgBlue", "bgMagenta", "bgCyan", "bgWhite",
		"reset", "bold", "dim", "italic", "underline", "inverse", "hidden", "strikethrough",
		"rainbow", "zebra", "america", "trap", "random", "zalgo"
	];

	if (!validColors.includes(color)) {
		const errorMessage: string = type ? `A cor "${color}" usada no "${type}" é ínvalida, usando cor padrão(${loggings.Alternative.color}).` : `A cor "${color}"é ínvalida , usando cor padrão(${loggings.Alternative.color}).`;
        
		if (!logHistory[errorMessage]) {
			logHistory[errorMessage] = true;
			core(errorMessage);
		}
        
		return loggings.Alternative.color;
	}

	return color;
}
