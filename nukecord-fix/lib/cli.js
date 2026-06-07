#!/usr/bin/env node
import 'dotenv/config';
import chalk from 'chalk';
import prompts from 'prompts';
import { Log, onCancel, spinner, sleep } from './utils/index.js';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import raidModules from './raids/index.js';
import { userDeclinedError } from './errors.js';
import NukecordClient from './client/index.js';
/*
    Supported flags:
        --token=TOKEN			# prioritized over NUKECORD_SELFBOT_TOKEN env variable
        --use-env				# use the NUKECORD_SELFBOT_TOKEN env variable, exit if doesn't exist
        --guild-id=GUILD_ID		# use this guild, exit if can't
*/
const maskToken = (raw) => {
    if (!raw)
        return '***';
    if (raw.length <= 12)
        return '***';
    return `${raw.slice(0, 6)}...${raw.slice(-4)}`;
};
const formatUserTag = (username, discriminator) => {
    if (!username)
        return 'unknown';
    if (!discriminator || discriminator === '0')
        return `@${username}`;
    return `${username}#${discriminator}`;
};
// ================================= Global Variables
let token;
const argv = yargs(hideBin(process.argv))
    .options({
    token: { type: 'string', alias: 't' },
    'use-env': { type: 'boolean', alias: 'u' },
    'guild-id': { type: 'string', alias: 'g' },
    // autopilot: { type: 'boolean', alias: 'a' },
})
    .parseSync();
let _spinner = spinner();
const client = new NukecordClient();
let targetGuild;
// ================================= Piece Functions
/**
 * Get the client token.
 * Respects script options.
 */
const getToken = async () => {
    // If --token=TOKEN is provided
    if (argv.token) {
        Log.info(`Using provided token: ${chalk.bold(maskToken(argv.token))}`);
        return argv.token;
    }
    // If --use-env is enabled
    if (argv.useEnv) {
        if (!process.env.NUKECORD_SELFBOT_TOKEN)
            throw new Error('Option --use-env was used but script could not find a NUKECORD_SELFBOT_TOKEN. Did you forget to add it to PATH?');
        Log.info(`Using token from env: ${chalk.bold(maskToken(process.env.NUKECORD_SELFBOT_TOKEN))}`);
        return process.env.NUKECORD_SELFBOT_TOKEN;
    }
    // This part is for the interactive wizard
    if (process.env.NUKECORD_SELFBOT_TOKEN) {
        Log.info(`Token found from env: ${chalk.bold(maskToken(process.env.NUKECORD_SELFBOT_TOKEN))}`);
        const { _useFromEnv } = await prompts({
            type: 'confirm',
            name: '_useFromEnv',
            message: 'Continue with this token?',
            initial: true,
        }, { onCancel });
        if (_useFromEnv)
            return process.env.NUKECORD_SELFBOT_TOKEN;
    }
    const { token } = await prompts({
        type: 'text',
        name: 'token',
        message: 'Enter your user token',
        format: value => value.trim(),
        validate: value => !!value,
    }, { onCancel });
    return token;
};
/**
 * Get the target guild.
 * Respects script options.
 */
const getTargetGuild = async () => {
    // If --guild-id=GUILD_ID is provided
    if (argv.guildId) {
        try {
            const _targetGuild = await client.guilds.fetch(argv.guildId);
            return _targetGuild;
        }
        catch (error) {
            throw new Error(`Client is missing access to given guild. \nEither the provided GUILD_ID is invalid or client is not present in the said guild.`);
        }
    }
    // This part is for the interactive wizard
    Log.info(`Retrieved ${chalk.bold(`${client.guilds.cache.size} guilds`)}`);
    const { _targetGuild } = await prompts({
        type: 'select',
        name: '_targetGuild',
        message: 'Select target guild',
        choices: client.guilds.cache.map(guild => ({
            title: guild.name,
            description: `[ID: ${guild.id}]`,
            value: guild.id,
        })),
        initial: 0,
        hint: '- Use arrow-keys. Return or Enter to submit.',
        format: id => client.guilds.cache.get(id),
    }, { onCancel });
    return _targetGuild;
};
// ================================= Error Handling
const fatalHandler = (error) => {
    // All errors are fatal and the script exits with code 1
    Log.error(error);
    process.exit(1);
};
process.on('uncaughtException', fatalHandler);
process.on('unhandledRejection', fatalHandler);
// ================================= Start Of Script
// Welcome human
Log.banner();
// Get token
token = await getToken();
// Try login and display relevant error
try {
    _spinner.start('Attempting Login...');
    await client.login(token);
    _spinner.text = 'Building client cache...';
}
catch (error) {
    _spinner.prefixText = `${Log.prefix('ERROR')}`;
    _spinner.fail('Login failed.');
    throw error;
}
// Wait for client to get ready
await client.getReady();
_spinner.stop();
Log.success(`Logged in as ${chalk.bold(formatUserTag(client.user?.username, client.user?.discriminator))} ${chalk.gray.dim(`[ID: ${client.user?.id}]`)}`);
// Sassy sleep statement
await sleep(500);
// Get target guild
targetGuild = await getTargetGuild();
// Filter raids by available permissions
const permittedRaids = raidModules.filter(raid => targetGuild.me?.permissions.has(raid.permission) ?? false);
// The client doesn't have sufficient permission for executing any raid
if (!permittedRaids.size) {
    Log.warn("Client doesn't have permissions for executing any raid");
    process.exit(0);
}
// Ask user to select atleast 1 raid module out of the permitted ones
const { selectedRaids } = await prompts({
    type: 'multiselect',
    name: 'selectedRaids',
    message: 'Choose the raid modules to execute',
    choices: permittedRaids.map(raid => ({
        title: raid.name,
        value: raid.name,
    })),
    min: 1,
    format: (raidNames) => permittedRaids.filter(raid => raidNames.includes(raid.name)),
}, { onCancel });
// Warning, because people may second guess their decisions
Log.warn(`Think twice before moving ahead, violence isn't always the answer (but sometimes it is)`);
// Are you really really sure?
const { _confirmRaid } = await prompts({
    type: 'confirm',
    name: '_confirmRaid',
    message: `Confirm raid execution on ${chalk.cyan(targetGuild.name)} with modules [${selectedRaids.map(raid => raid.name).join(', ')}] ?`,
    initial: true,
}, { onCancel });
// User declined to proceed
if (!_confirmRaid)
    throw userDeclinedError;
// Execute the selected raids
for (const raid of selectedRaids.values())
    await raid.execute(targetGuild);
// We're done!
Log.success('Raid completed, exitting script.');
process.exit(0);
// =================================  Bye Bye
/*
    "Hisashiburi, Handler One"
        - Shinei Nouzen
*/
