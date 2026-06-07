import { Collection } from 'discord.js-selfbot-v13';
import { Raid, RaidName } from './../typings/index.js';
/**
 * A collection of all raid modules
 */
declare const raidModules: Collection<RaidName, Raid>;
export default raidModules;
