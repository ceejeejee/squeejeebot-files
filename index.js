// require('dotenv').config()

// const {Client, IntentsBitField, Embed, Attachment, AttachmentBuilder} = require("discord.js");
// const { Image } = require('image-js');
// const fs = require('fs');
// const { execFile } = require('child_process');
import dotenv from 'dotenv'
dotenv.config()
import {Client, IntentsBitField, Embed, Attachment, AttachmentBuilder} from "discord.js";
import { Image } from'image-js';
import fs from 'fs';
import { execFile } from 'child_process';
import gifsicle from "gifsicle";

const SUPPORTED_IMGS = ['.png', '.jpg', '.TIFF'];

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
    // console.log(message);

    if(!message?.author.bot){
        
        if(message?.attachments !== undefined){
            if(message.content !== ''){
                message.channel.send({content: `${message.author.username} said ${message.content}`}).catch(error => console.log(error));
            }

            const attachmentsMap = message.attachments;
            
            message.attachments.forEach(async a => {
                try{
                    const data = await fetch(a.url);
                    const buffer = new DataView(await data.arrayBuffer());
                    const fileExt = a.name.slice(a.name.lastIndexOf('.'));
                    fs.writeFileSync(`./temp${fileExt}`, buffer);
                    const filename = await resize(fileExt);
                    console.log(filename);

                    const attachment = new AttachmentBuilder(filename);
                    message.channel.send({files: [attachment]})
                        .then(
                            message.delete()
                                .then(msg => console.log(`Deleted message from ${msg.author.username}`)))
                        .catch(error => console.log(error));

                }catch(error){
                    console.log(error);
                    errorMessage();
                }
            });
        }     
    }
});

async function resize(fileExt){
    if(SUPPORTED_IMGS.includes(fileExt)){
        const resizePromise = new Promise(async (resolve) => {
            let image = await Image.load(`./temp${fileExt}`);
            image.resize({ width: 200 });
            await image.save(`./temp${fileExt}`)
            console.log('image resized!');
            resolve(`./temp${fileExt}`);
        });
        return resizePromise;
            

    }else if(fileExt === '.gif'){
        const resizePromise = new Promise(async (resolve) => {
            console.time('execute time');
            // Gifsicle implementation: https://stackoverflow.com/questions/47138754/nodejs-animated-gif-resizing
            execFile(gifsicle, ['--resize-fit-width', '300', '-o', `./temp_smol${fileExt}`, `./temp${fileExt}`], err => {
                console.timeEnd('execute time');

                if (err) {
                    throw err;
                }

                console.log('image resized!');
                resolve(`./temp_smol${fileExt}`);
            });
        });
        return resizePromise;

    }else{
        errorMessage();
    }
}

function errorMessage(){
    message.channel.send("couldn't process image :bangbang: sowwy,,,");
}

// function replaceFile(filename){
//     
// }