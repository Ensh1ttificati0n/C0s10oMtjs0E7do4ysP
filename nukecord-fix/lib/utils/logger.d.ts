type LogLevel = 'ERROR' | 'SUCCESS' | 'INFO' | 'PROGRESS' | 'WARN';
/**
 * Utility class for neat logging.
 * This will later be a separate package: toodles sexy logger
 */
declare class Log {
    /**
     * Colors for different log levels
     */
    private static _colorLevels;
    /**
     * Prefixes used to print messages
     * @param logLevel Log level of the prefix
     */
    static prefix(logLevel: LogLevel): string;
    /**
     * Print a plain message (same as console.log)
     * @param message Message to print
     */
    static plain(message: any): void;
    /**
     * Print an error message
     * @param message Message to print
     */
    static error(message: any): void;
    /**
     * Print a success message
     * @param message Message to print
     */
    static success(message: any): void;
    /**
     * Print an info message
     * @param message Message to print
     */
    static info(message: any): void;
    /**
     * Print a warn message
     * @param message Message to print
     */
    static warn(message: any): void;
    /**
     * Print a progress message
     * @param message Message to print
     */
    static progress(message: any): void;
    /**
     * Print the banner
     * @param clearScreen Should clear screen?
     */
    static banner(clearScreen?: boolean): void;
}
export default Log;
export { LogLevel };
