// import dotenv from 'dotenv';
// dotenv.config();

// import Discord from "discord.js";
// import { Image } from'image-js';
// import fs from 'fs/promises';
// import { execFile } from 'child_process';
// import Enmap from 'enmap';
// import util from "util/types";

require('dotenv').config()
const Discord = require('discord.js');
const {Image} = require('image-js');
const fs = require('fs/promises');
const child_process = require('child_process');
const Enmap = require('enmap');
const gifResize = require('@gumlet/gif-resize');


const SUPPORTED_IMGS = ['.png', '.jpg', '.TIFF'];
const SUPPORTED_IMG_EXT = new RegExp(`/\.(png|jpg|tiff)/`);

const client = new Discord.Client({
    intents:    [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.MessageContent,
    ],
});

client.config = require("./config.js");
require('./clientFunctions.js')(client);

client.commands = new Enmap();
client.aliases = new Enmap();
client.settings = new Enmap();

const init = async () => {
    // load commands
    cmdFiles = await fs.readdir("./commands");
    cmdFiles.forEach((f) => {
      if (!f.endsWith(".js")) return;
      const response = client.loadCommand(f);
      if (response) {
        console.log(response);
      }
    });
    client.login(process.env.DISCORD_TOKEN);
    
};

init();


client.on('ready', (c) => {
    console.log(`${c.user.tag} is online`);
});

client.on("messageCreate", async (message) => {
    console.log(message.content);
    // const settings = (message.settings = client.getSettings(message.guild.id));

    // TODO: IMPLEMENT PREFIX CUSTOMIZATION AND CONFIG/SETTINGS
    // Ignore non-commands
    if(!message.content.startsWith('%')) return;
    // if (!message.content.startsWith(client.settings.prefix)) {

    //     return console.log(`1: ${client.settings.prefix}`);
    // } 
    // if (!message.content.startsWith(`${settings.prefix} `)) return console.log('2');

    // Parse Commands
    // const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const args = message.content.slice('%'.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (message.author.bot) return;

    const cmd =
        client.commands.get(command) ||
        client.commands.get(client.aliases.get(command));
    
    if (cmd && !message.guild && cmd.conf.guildOnly)
    return message.channel.send(
        "This command is unavailable via private message. Please run this command in a server."
    );

    cmd.run(client, message);

//     if(!message?.author.bot){
//         // resend text messages & file attachments
//         if(message?.attachments !== undefined){
//             // resend text message if message.content is not empty
//             if(message.content !== ''){
//                 message.channel.send({content: `${message.author.username} said ${message.content}`}).catch(error => console.log(error));
//                 message.delete().then(msg => console.log(`Deleted message from ${msg.author.username}`));
//             }
            
//             // resends attachments if they can be processed
//             message.attachments.forEach(async a => {
//                 try{
//                     const path = `./${message.guild}/${message.channel}/${message.author.username}`;
//                     const data = await fetch(a.url);
//                     const buffer = new DataView(await data.arrayBuffer());
//                     const fileExt = a.name.slice(a.name.lastIndexOf('.'));
//                     const filename = `${message.guild.name}${message.channel.name}_${message.author.username}${fileExt}`;

//                     await fs.writeFile(`./temp/${filename}`, buffer);

//                     await resize(filename, fileExt);
//                     console.log(`saved as: ${filename}`);

//                     const attachment = new Discord.AttachmentBuilder(`./temp/smol_${filename}`);
//                     message.channel.send({files: [attachment]})
//                         .then(
//                             message.delete()
//                                 .then(msg => console.log(`Deleted message from ${msg.author.username}`)));
                    
//                     fs.rm(`./temp/${filename}`, {}, (err) => {
//                         if(err){
//                             // File deletion failed
//                             console.error(err.message);
//                             return;
//                         }
//                     });
//                     fs.rm(`./temp/smol_${filename}`, {}, (err) => {
//                         if(err){
//                             // File deletion failed
//                             console.error(err.message);
//                             return;
//                         }
//                     });

//                 }catch(error){
//                     console.log(error);
//                     message.channel.send("couldn't process image :bangbang: sowwy,,,");
//                 }
//             });
//         }
//     }
});

async function resize(filename, fileExt){
    if(SUPPORTED_IMG_EXT.test(fileExt)){
        const resizePromise = new Promise(async (resolve) => {
            let image = await Image.load(`./temp/${filename}`);
            const smolImage = image.resize({ width: 300 });
            await smolImage.save(`./temp/smol_${filename}`)
            console.log('image resized!');
            resolve(filename);
        });
        return resizePromise;
            

    }else if(new RegExp(`gif`).test(fileExt)){
        const resizePromise = new Promise(async (resolve) => {
            const buf = await fs.readFile(`./temp/${filename}`);
            await gifResize({
                width: 200
            })(buf).then(async (data) => {
                await fs.writeFile(`./temp/smol_${filename}`, data);
            });
            resolve(filename);
        });
        return resizePromise;

    }else{
        throw new Error("couldn't process file");
    }
};