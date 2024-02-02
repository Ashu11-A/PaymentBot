import { getTimestamp } from "@/controllers/loggings/getTimestamp";
import { loggings } from "@/controllers/loggings/params";
import colors from "colors";
import { RegisterLog, registerlog } from "@/controllers/loggings/registerlog";
import { Colors, ConsoleLog as ConsoleLogger, LogType } from "@/controllers/loggings/Types";
import { Checker } from "@/controllers/loggings/Checker";
import { LoggingsOptions } from "@/controllers/Loggings";
import { WhiteColors, WhiteLogs } from "@/controllers/loggings/Colors";
import { settings } from '@/settings'
import { json } from "@/functions";

const cores: Colors = colors;
type LogMessage = string | number | boolean | object;

export function logs(controller: string, level: string, color: string, options: LoggingsOptions, args: LogMessage[]) {
	const argumentss = args
	const message = WhiteColors(argumentss);
	// const message = msg + args.join(); // converte os args em uma string separando por " "
	let ArchiveLog: string | RegisterLog = "";

	const valoressssss = json(settings.Logs.configPATH + "/loggings.json");
	const CURRENT_LOG_LEVEL = valoressssss.level || "Debug"; // Altere o nível atual conforme necessário
	// carrega o codigo
	const levelConfig: LogType = loggings[level];
	const currentLevelConfig = loggings[CURRENT_LOG_LEVEL];

	const ColorController = Checker(color, controller);
	const SelectedColor = !levelConfig.color ? "white" : Checker(levelConfig?.color, level);
	if (level === "OnlyLog") {
		const { fulltimer, timestamp } = getTimestamp();
		const formattedMessage = WhiteLogs(argumentss); // remove o parametro de cores
		if (options.register?.type === "log") {
			ArchiveLog = `[ ${options.register?.timer === "timestamp" ? timestamp : fulltimer
				} ] [ ${controller} ] ${formattedMessage}`;
		} else if (options.register?.type === "json") {
			ArchiveLog = {
				time: options.register?.timer === "timestamp" ? timestamp.toString() : fulltimer,
				controller,
				message: formattedMessage,
			};
		} else {
			ArchiveLog = `[ ${options.register?.timer === "timestamp" ? timestamp : fulltimer
				} ] [ ${controller} ] ${formattedMessage}`;
		}
		return registerlog(controller, ArchiveLog, "Register");
	}

	if (level === "OnlyConsole") {
		const { currentHour } = getTimestamp();
		const ConsoleLog: ConsoleLogger = {
			currentHour,
			color: ColorController,
			controller,
			levelColor: SelectedColor,
			level: "Console",
			message,
		};
		return MakeLog(ConsoleLog);
	}

	if (levelConfig.level <= currentLevelConfig.level) {
		const { currentHour, fulltimer, timestamp } = getTimestamp();
		const ConsoleLog: ConsoleLogger = {
			currentHour,
			color: ColorController,
			controller,
			levelColor: SelectedColor,
			level,
			message,
		};
		MakeLog(ConsoleLog);
		const formattedMessage = WhiteLogs(argumentss); // remove o parametro de cores
		if (options.register?.type === "log") {
			ArchiveLog = `[ ${options.register?.timer === "timestamp" ? timestamp : fulltimer
				} ] [ ${controller} ] ${formattedMessage}`;
		} else if (options.register?.type === "json") {
			ArchiveLog = {
				time: options.register?.timer === "timestamp" ? timestamp.toString() : fulltimer,
				controller,
				level,
				message: formattedMessage,
			};
		} else {
			ArchiveLog = `[ ${options.register?.timer === "timestamp" ? timestamp : fulltimer
				} ] [ _.${controller}._ ] ${formattedMessage}`;
		}
		registerlog(controller, ArchiveLog, level);
	}
}

// Atualize a função MakeLog para aplicar cores na mensagem
function MakeLog(ConsoleLog: ConsoleLogger) {
	const { currentHour, color, controller, levelColor, level, message } = ConsoleLog;
	const formattedController = cores[color](controller);
	const formattedLevel = cores[levelColor](level);
	const formattedMessage = message; // Aplicar cores à mensagem

	console.log(`| ${currentHour} | ${formattedController} - ${formattedLevel} | ${formattedMessage}`);
}
