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
});