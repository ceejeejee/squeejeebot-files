const Discord = require('discord.js');
const {Image} = require('image-js');
const fs = require('fs/promises');
const gifResize = require('@gumlet/gif-resize');

exports.run = (client, message) => {
    console.log('found command');
    // resend text messages & file attachments
    if(message?.attachments !== undefined){
        // resends attachments if they can be processed
        message.attachments.forEach(async a => {
            try{
                const data = await fetch(a.url);
                const buffer = new DataView(await data.arrayBuffer());
                const fileExt = a.name.slice(a.name.lastIndexOf('.'));
                const filename = `${message.guild.name}${message.channel.name}_${message.author.username}${fileExt}`;

                await fs.writeFile(`./temp/${filename}`, buffer);

                if(new RegExp(/\.(png|jpg|tiff)/gi).test(fileExt)){
                    const resizePromise = new Promise(async (resolve) => {
                        let image = await Image.load(`./temp/${filename}`);
                        const smolImage = image.resize({ width: 300 });
                        await smolImage.save(`./temp/smol_${filename}`)
                        console.log('image resized!');
                        resolve(filename);
                    });
                    await resizePromise;
                        
            
                }else if(new RegExp(/\.gif/gi).test(fileExt)){
                    const resizePromise = new Promise(async (resolve) => {
                        const buf = await fs.readFile(`./temp/${filename}`);
                        await gifResize({
                            width: 200
                        })(buf).then(async (data) => {
                            await fs.writeFile(`./temp/smol_${filename}`, data);
                        });
                        resolve(filename);
                    });
                    await resizePromise;
            
                }else{
                    throw new Error("couldn't process file");
                }

                console.log(`saved as: ${filename}`);

                const attachment = new Discord.AttachmentBuilder(`./temp/smol_${filename}`);
                message.channel.send({files: [attachment]})
                    .then(
                        message.delete()
                            .then(msg => console.log(`Deleted message from ${msg.author.username}`)));
                
                fs.rm(`./temp/${filename}`, {}, (err) => {
                    if(err){
                        // File deletion failed
                        console.error(err.message);
                        return;
                    }
                });
                fs.rm(`./temp/smol_${filename}`, {}, (err) => {
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
};
exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
};
exports.help = {
    name: "compress",
    category: "File Processing",
    description: "Resends images and gifs to a set size",
    usage: ["compress"],
};