import dotenv from 'dotenv';
dotenv.config();

import {Client, IntentsBitField, Embed, Attachment, AttachmentBuilder, Collection, Events, GatewayIntentBits} from "discord.js";
import { Image } from'image-js';
import fs from 'fs';
import { execFile } from 'child_process';
import gifsicle from "gifsicle";
import path from 'node:path';

const client = new Client({
    intents:    [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// client.commands = new Collection();

// const commandsPath = './commands';
// const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// // for (const file of commandFiles) {
// // 	const filePath = path.join(commandsPath, file);
// // 	const command = from filePath;
// // 	// Set a new item in the Collection with the key as the command name and the value as the exported module
// // 	if ('data' in command && 'execute' in command) {
// // 		client.commands.set(command.data.name, command);
// // 	} else {
// // 		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
// // 	}
// // }
// const cmdFiles = fs.readdir("./commands", (err, files) =>{
//     files.forEach((f) => {
//         if (!f.endsWith(".js")) return;
//             const response = client.loadCommand(f);
//         if (response) {
//             console.log(response);
//         }
//     });
// });


const SUPPORTED_IMGS = ['.png', '.jpg', '.TIFF'];

client.login(process.env.DISCORD_TOKEN);

client.on("messageCreate", async (message) => {
    // console.log(message);

    // resend text messages & file attachments
    if(!message?.author.bot){
        
        if(message?.attachments !== undefined){
            // resend text message if message.content is not empty
            if(message.content !== ''){
                message.channel.send({content: `${message.author.username} said ${message.content}`}).catch(error => console.log(error));
                message.delete().then(msg => console.log(`Deleted message from ${msg.author.username}`));
            }
            
            // resends attachments if they can be processed
            message.attachments.forEach(async a => {
                try{
                    const path = `./${message.guild}/${message.channel}/${message.author.username}`;
                    const data = await fetch(a.url);
                    const buffer = new DataView(await data.arrayBuffer());
                    const fileExt = a.name.slice(a.name.lastIndexOf('.'));
                    const filename = `./temp/${message.guild.name}${message.channel.name}_${message.author.username}${fileExt}`;

                    fs.writeFileSync(filename, buffer);
                    
                    await resize(filename, fileExt);
                    console.log(`saved as: ${filename}`);

                    const attachment = new AttachmentBuilder(filename);
                    message.channel.send({files: [attachment]})
                        .then(
                            message.delete()
                                .then(msg => console.log(`Deleted message from ${msg.author.username}`)));
                    fs.rm(filename, (err) => {
                        if(err){
                            // File deletion failed
                            console.error(err.message);
                            return;
                        }
                    });

                }catch(error){
                    console.log(error);
                    message.channel.send("couldn't process image :bangbang: sowwy,,,");
                }
            });
        }     
    }
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

async function resize(filename, fileExt){
    if(SUPPORTED_IMGS.includes(fileExt)){
        const resizePromise = new Promise(async (resolve) => {
            let image = await Image.load(filename);
            image.resize({ width: 200 });
            await image.save(filename)
            console.log('image resized!');
            resolve(filename);
        });
        return resizePromise;
            

    }else if(fileExt === '.gif'){
        const resizePromise = new Promise(async (resolve) => {
            console.time('execute time');
            // Gifsicle implementation: https://stackoverflow.com/questions/47138754/nodejs-animated-gif-resizing
            execFile(gifsicle, ['--resize-fit-width', '300', '-o', filename, filename], err => {
                console.timeEnd('execute time');

                if (err) {
                    throw err;
                }

                console.log('image resized!');
                resolve(filename);
            });
        });
        return resizePromise;

    }else{
        throw new Error("couldn't process file")
    }
}