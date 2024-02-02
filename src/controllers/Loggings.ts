import { logs } from "@/controllers/loggings/logs";
export type LoggingsColors =
    | "strip"
    | "stripColors"
    | "black"
    | "red"
    | "green"
    | "yellow"
    | "blue"
    | "magenta"
    | "cyan"
    | "white"
    | "gray"
    | "grey"
    | "bgBlack"
    | "bgRed"
    | "bgGreen"
    | "bgYellow"
    | "bgBlue"
    | "bgMagenta"
    | "bgCyan"
    | "bgWhite"
    | "reset"
    | "bold"
    | "dim"
    | "italic"
    | "underline"
    | "inverse"
    | "hidden"
    | "strikethrough"
    | "rainbow"
    | "zebra"
    | "america"
    | "trap"
    | "random"
    | "zalgo";

/**
 * Opções para configurar o comportamento da classe Loggings.
 *
 * @interface LoggingsOptions
 * @property {object} register - Opções relacionadas ao registro.
 * @property {"default" | "timestamp"} register.timer - Define o formato do temporizador para os registros.
 * @property {"log" | "json"} register.type - Define o tipo de registro para saída.
 * @property {object} console - Opções relacionadas à saída no console.
 * @property {"default" | "timestamp"} console.timer - Define o formato do temporizador para as saídas no console.
 */
export interface LoggingsOptions {
    register?: {
        timer: "default" | "timestamp";
        type: "log" | "json";
    };
}
export type LogMessage = string | number | boolean | object;

/**
 * ### Controlador de Logs, params
 * 
 * @class Loggings
 * @param {string} title - O título para os logs.
 * @param {LoggingsColors} color - A cor usada para o titulo na loggings.
 * 
 * @param {LoggingsOptions} options - Opções adicionais no loggings.
 * 
```ts
const core = new Loggings("Titulo", "green", {options})
```
 ** #### Opções para configurar o comportamento da classe Loggings(opcional).

 * @property {object} register - Opções relacionadas ao registro.
 * @property {"default" | "timestamp"} register.timer - Define o formato do temporizador para os registros.
 * @property {"log" | "json"} register.type - Define o tipo de registro para saída.
 * @property {object} console - Opções relacionadas à saída no console.
 * @property {"default" | "timestamp"} console.timer - Define o formato do temporizador para as saídas no console.
 * 
 *
 */
class Loggings {
	private title: string;
	private color: LoggingsColors;
	private options: LoggingsOptions;

	constructor(title: string = "Core", color: LoggingsColors = "blue", options: LoggingsOptions = {}) {
		this.title = title;
		this.color = color;
		this.options = options;
	}

	/**
     * Registra uma mensagem de log.
     *
     * @param {LogMessage} args - A mensagem de log.
     */
	log(...args: LogMessage[]): void {
		logs(this.title, "Info", this.color, this.options, args);
	}

	/**
     * Registra uma mensagem de erro.
     *
     * @param {LogMessage} args - A mensagem de erro.
     */
	error(...args: LogMessage[]): void {
		logs(this.title, "Error", this.color, this.options, args);
	}

	/**
     * Registra uma mensagem de aviso.
     *
     * @param {LogMessage} args - A mensagem de aviso.
     */
	warn(...args: LogMessage[]): void {
		logs(this.title, "Warn", this.color, this.options, args);
	}

	/**
     * Registra uma mensagem de informação.
     *
     * @param {LogMessage} args - A mensagem de informação.
     */
	info(...args: LogMessage[]): void {
		logs(this.title, "Info", this.color, this.options, args);
	}

	/**
     * Registra uma mensagem de depuração.
     *
     * @param {LogMessage} args - A mensagem de depuração.
     */
	debug(...args: LogMessage[]): void {
		logs(this.title, "Debug", this.color, this.options, args);
	}

	/**
     * Registra uma mensagem no console sem salvá-la em um arquivo de log.
     *
     * @param {LogMessage} args - A mensagem a ser registrada no console.
     */
	sys(...args: LogMessage[]): void {
		logs(this.title, "OnlyConsole", this.color, this.options, args);
	}

	/**
     * Registra uma mensagem diretamente no arquivo de logs, não aparecendo no console.
     *
     * @param {LogMessage} logtext - A mensagem a ser registrada no arquivo de log.
     */
	txt(...args: LogMessage[]): void {
		logs(this.title, "OnlyLog", this.color, this.options, args);
	}
}

/**
 * #### Type LoggingsConstructor
 *
 * ```ts
 * import Loggings { LoggingsConstructor } from "@/controllers/Loggings"
 *
 * const core:LoggingsConstructor = new Loggings("Exemplo", "blue")
 * ```
 */
export type LoggingsConstructor = new (title: string, color: string) => Loggings;

/**
 * #### Type LoggingsMethods
 *
 * ```ts
 * import {LoggingsMethods} from "@/controllers/Loggings"
 * function Core(core: LoggingsMethods) {
 * core.log("Olá")
 * }
 * ```
 */
export type LoggingsMethods = {
    log: (...args: LogMessage[]) => void;
    error: (...args: LogMessage[]) => void;
    warn: (...args: LogMessage[]) => void;
    info: (...args: LogMessage[]) => void;
    debug: (...args: LogMessage[]) => void;
    sys: (...args: LogMessage[]) => void;
    txt: (...args: LogMessage[]) => void;
};

export default Loggings;
