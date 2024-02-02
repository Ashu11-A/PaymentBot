/**
 * Interface @/controllers/loggings/params
 */
import { LoggingsColors } from "@/controllers/Loggings";

export interface LogType {
    level: number;
    color: LoggingsColors;
}

export interface Loggings {
    [key: string]: LogType;
}
/* eslint-disable  @typescript-eslint/no-explicit-any */
export type Colors = {
    enable(): void;
    disable(): void;
    setTheme(theme: any): void;

    strip(str: string): string;
    stripColors(str: string): string;

    black(str: string): string;
    red(str: string): string;
    green(str: string): string;
    yellow(str: string): string;
    blue(str: string): string;
    magenta(str: string): string;
    cyan(str: string): string;
    white(str: string): string;
    gray(str: string): string;
    grey(str: string): string;

    bgBlack(str: string): string;
    bgRed(str: string): string;
    bgGreen(str: string): string;
    bgYellow(str: string): string;
    bgBlue(str: string): string;
    bgMagenta(str: string): string;
    bgCyan(str: string): string;
    bgWhite(str: string): string;

    reset(str: string): string;
    bold(str: string): string;
    dim(str: string): string;
    italic(str: string): string;
    underline(str: string): string;
    inverse(str: string): string;
    hidden(str: string): string;
    strikethrough(str: string): string;

    rainbow(str: string): string;
    zebra(str: string): string;
    america(str: string): string;
    trap(str: string): string;
    random(str: string): string;
    zalgo(str: string): string;
    [key: string]: ((...args: string[]) => string) | any;
};

/**
 * Interface @/Controllers/Loggings/Logs
 */

export interface ConsoleLog {
    currentHour: string;
    color: string;
    controller: string;
    levelColor: string;
    level: string;
    message: string;
}

export interface Cores {
    [key: string]: [string];
}