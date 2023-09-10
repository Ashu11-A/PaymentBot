import { Loggings } from "interfaces/Controllers";

export const loggings: Loggings = {
	Error: {
		level: 0,
		color: "red",
	},
	Core: {
		level: 0,
		color: "green",
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