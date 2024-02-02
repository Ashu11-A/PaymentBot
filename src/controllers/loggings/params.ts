import { Loggings } from "@/controllers/loggings/Types";

export const loggings: Loggings = {
	Error: {
		level: 0,
		color: "red",
	},
	OnlyConsole: {
		level: 0,
		color: "red",
	},
	OnlyLog: {
		level: 0,
		color: "red",
	},
	Warn: {
		level: 1,
		color: "yellow",
	},
	Log: {
		level: 2,
		color: "cyan",
	},
	Info: {
		level: 2,
		color: "cyan",
	},
	Debug: {
		level: 3,
		color: "magenta",
	},
	Alternative: {
		level: 0,
		color: "white",
	},
};
