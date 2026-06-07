import { Collection } from 'discord.js-selfbot-v13';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Log } from './../utils/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * A collection of all raid modules
 */
const raidModules = new Collection();
const raidFiles = readdirSync(__dirname).filter(file => file.endsWith('.js') && !file.startsWith('index'));
const seenIds = new Set();
for (const raidFile of raidFiles) {
    const mod = await import(join('file://', __dirname, raidFile));
    const raid = mod.default;
    if (!raid || typeof raid.name !== 'string' || typeof raid.execute !== 'function') {
        Log.warn(`Skipping ${raidFile}: file does not export a valid Raid as default`);
        continue;
    }
    if (seenIds.has(raid.id)) {
        Log.warn(`Duplicate raid id ${raid.id} on ${raid.name} — order will be indeterminate`);
    }
    seenIds.add(raid.id);
    raidModules.set(raid.name, raid);
}
raidModules.sort((a, b) => a.id - b.id);
export default raidModules;
