module.exports = async (client) => {
    client.loadCommand = (commandName) => {
        try {
            const props = require(`./commands/${commandName}`);
            if (props.init) props.init(client);
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
};