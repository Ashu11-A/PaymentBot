import { json } from "utils/Json";
import { getTimestamp } from "controllers/loggings/getTimestamp";
import { config } from '@/app'
import { loggings } from "controllers/loggings/params";
import colors from "colors";
import { registerlog } from "controllers/loggings/registerlog";
import { ConsoleLog as ConsoleLogger } from "interfaces/Controllers";
import { CheckColors } from "controllers/loggings/CheckColors";

const cores:any = colors;

export function logs(controller: string, message: string, level: string, color: string) {
	const valoressssss = json(config.Logs.configPATH + "/loggings.json");
	const CURRENT_LOG_LEVEL = valoressssss.level || "Debug"; // Altere o nível atual conforme necessário
	// carrega o codigo
	const levelConfig: any = loggings[level];
	const currentLevelConfig = loggings[CURRENT_LOG_LEVEL];

	const ColorController = CheckColors(color, controller);
	const SelectedColor = !levelConfig.color ? "white" : CheckColors(levelConfig?.color, level);
	if (level === "Core") {
		const { currentHour } = getTimestamp();
		const ConsoleLog: ConsoleLogger = {
			currentHour,
			color: ColorController,
			controller,
			levelColor: SelectedColor,
			level,
			message
		};
		return MakeLog(ConsoleLog);
	}

	if (levelConfig.level <= currentLevelConfig.level) {
		const { currentHour, fulltimer } = getTimestamp();
		const ConsoleLog: ConsoleLogger = {
			currentHour,
			color: ColorController,
			controller,
			levelColor: SelectedColor,
			level,
			message
		};
		MakeLog(ConsoleLog);
		const formattedMessage = RemoveColorsParams(message); // remove o parametro de cores 
		const ArchiveLog = `[ ${fulltimer} ] [ ${controller} - ${level} ] ${formattedMessage}`;
		registerlog(controller, ArchiveLog, level);
	}
}

// Função para remover o padrão de cores na log
function RemoveColorsParams(message: string): string {
	const colorTagPattern = /\[([^\]]+)\]\.(\w+)/g;
	return message.replace(colorTagPattern, (_, text) => {
		const message = `"${text}"`;
		return message; // Retornar o texto original se a cor não for encontrada
	});
}


// Função para substituir os padrões de cor na mensagem
function applyColorTags(message: string): string {
	const colorTagPattern = /\[([^\]]+)\]\.(\w+)/g;
	return message.replace(colorTagPattern, (_, text, color) => {
		const colorFunction = cores[CheckColors(color, `[${text}]`)];
		if (colorFunction) {
			return colorFunction(text);
		} else {
			return text; // Retornar o texto original se a cor não for encontrada
		}
	});
}


// Atualize a função MakeLog para aplicar cores na mensagem
function MakeLog(ConsoleLog: ConsoleLogger) {
	const { currentHour, color, controller, levelColor, level, message } = ConsoleLog;
	const formattedController = cores[color](controller);
	const formattedLevel = cores[levelColor](level);
	const formattedMessage = applyColorTags(message); // Aplicar cores à mensagem

	console.log(`| ${currentHour} | ${formattedController} - ${formattedLevel} | ${formattedMessage}`);
}
