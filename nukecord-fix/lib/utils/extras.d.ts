import { Ora } from 'ora';
/**
 * onCancel on prompt aborts
 */
declare const onCancel: () => never;
/**
 * Await this to create a sleep
 * @param duration Sleep duration in milliseconds
 */
declare const sleep: (duration: number) => Promise<void>;
/**
 * Re-usable generic spinner factory
 * @param text Text to display after the spinner.
 */
declare const spinner: (text?: string) => Ora;
/**
 * Get a random element from an array
 * @param arr: The array to pick from
 */
declare const randomFrom: <T>(arr: T[]) => T;
export { onCancel, sleep, spinner, randomFrom };
