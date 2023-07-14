import Discord from 'discord.js';

exports.run = (message) => {
    if(!message?.author.bot){
        // resend text messages & file attachments
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
                    const filename = `${message.guild.name}${message.channel.name}_${message.author.username}${fileExt}`;

                    await fs.writeFile(`./temp/${filename}`, buffer);

                    if(SUPPORTED_IMGS.includes(fileExt)){
                        const resizePromise = new Promise(async (resolve) => {
                            let image = await Image.load(`./temp/${filename}`);
                            const smolImage = image.resize({ width: 300 });
                            await smolImage.save(`./temp/smol_${filename}`)
                            console.log('image resized!');
                            resolve(filename);
                        });
                            
                
                    }else if(fileExt === '.gif'){
                        const resizePromise = new Promise(async (resolve) => {
                            const buf = await fs.readFile(`./temp/${filename}`);
                            await gifResize({
                                width: 200
                            })(buf).then(async (data) => {
                                await fs.writeFile(`./temp/smol_${filename}`, data);
                            });
                            resolve(filename);
                        });
                
                    }else{
                        throw new Error("couldn't process file")
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
    }

    async function resize(filename, fileExt){
        if(SUPPORTED_IMGS.includes(fileExt)){
            const resizePromise = new Promise(async (resolve) => {
                let image = await Image.load(`./temp/${filename}`);
                const smolImage = image.resize({ width: 300 });
                await smolImage.save(`./temp/smol_${filename}`)
                console.log('image resized!');
                resolve(filename);
            });
            return resizePromise;
                
    
        }else if(fileExt === '.gif'){
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
            throw new Error("couldn't process file")
        }
    }
};
exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
};
exports.help = {
    name: "compress",
    category: "File Processing",
    description: "Resends images and gifs to a set size",
    usage: ["compress"],
};