module.exports = async (client) => {
    client.loadCommand = (commandName) => {
        try {
            const props = require(`./commands/${commandName}`);
            client.commands.set(props.help.name, props);
            props.conf.aliases.forEach((alias) => {
                client.aliases.set(alias, props.help.name);
            });
            return false;
        } catch (e) {
            console.log(`Bot was unable to load command ${commandName}: ${e}`);
            return `Unable to load command ${commandName}: ${e}`;
        }
    };

    // Guild Settings
    client.getSettings = (guild) => {
        const defaults = client.config.defaultSettings || {};
        if (!guild) return defaults;
        const guildData = client.settings.get(guild) || {};
        const returnObject = {};
        Object.keys(defaults).forEach((key) => {
        returnObject[key] = guildData[key] ? guildData[key] : defaults[key];
        });
        return returnObject;
    };
};