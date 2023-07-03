require('dotenv').config()

const {Client, IntentsBitField, Embed} = require("discord.js");

const client = new Client({
    intents:    [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.login(process.env.DISCORD_TOKEN);

client.on("messageCreate", async (message) => {
    console.log(message)

    if(!message?.author.bot){
        message.delete()
            .then(msg => console.log(`Deleted message from ${msg.author.username}`))
            .catch(console.error);
        
        message.channel.send(`${message.author.username} said ${message.content}`);
        if(message?.attachments !== undefined){
            const attachmentsMap = message.attachments;
            attachmentsMap.forEach(elem => message.channel.send(elem.url));
            
        }
    }
});