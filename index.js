require('dotenv').config()

const {Client, IntentsBitField, Embed, Attachment, AttachmentBuilder} = require("discord.js");
const { Image } = require('image-js');

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
    console.log(message);

    if(!message?.author.bot){
        
        if(message?.attachments !== undefined){
            if(message.content !== ''){
                message.channel.send({content: `${message.author.username} said ${message.content}`}).catch(error => console.log(error));
            }

            const attachmentsMap = message.attachments;
            attachmentsMap.map(async elem => {
                try{
                    const data = await fetch(elem.url);
                    const buffer = await data.arrayBuffer();
                    let image = await Image.load(buffer);
                    image.resize({ width: 200 });
                    await image.save('temp.png');
                    const attachment = new AttachmentBuilder('temp.png');
                    message.channel.send({files: [attachment]})
                    .then(
                        message.delete()
                            .then(msg => console.log(`Deleted message from ${msg.author.username}`)))
                    .catch(error => console.log(error));
                }catch(error){
                    console.log(error);
                    message.channel.send("couldn't process image! sowwy,,,");
                }
            });
        }
        
    }
});