const Discord = require("discord.js");
const YTDL = require("ytdl-core");

const tokens = require('./tokens.json');

function generateHex() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function play(connection, message) {
    var server = servers[message.guild.id];

    server.dispacher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

    server.queue.shift();

    server.dispacher.on("end", function() {
        if (server.queue[0]) play(connection, message);
        else connection.disconnect();
    });
}

var bot = new Discord.Client({autoReconnect:true});

var servers = {};

bot.on("guildMemberAdd", function(member){
    member.guild.channels.find("name", " ").sendMessage(member.toString() + " Bienvenue a toi");
});

bot.on("message", function(message) {
    if (message.author.equals(bot.user)) return;

    if (message.content === "Hello") {
        message.reply("Salut toi");
    }

    if (!message.content.startsWith(tokens.prefix)) return;

    var args = message.content.substring(tokens.prefix.length).split(" ");

    switch (args[0].toLowerCase()) {
        case "ping":
            message.channel.send("pong!");
            break;
        
        case "info":
            message.channel.send("Je suis un super-bot qui ne sert à rien");
            break;

        case "help":
            var help = new Discord.RichEmbed()
                .setTitle("Bot Videal |  help")
                .addField("Commandes Owner", "reload" )
                .addField("Commandes", "help, notice, play, pause, resume, skip, stop, clear" )
                .setColor(0x00FFFF)
                .setFooter("Bot Videal | aides des commandes | Faites <la commande> help")
                .setThumbnail(message.author.avatarURL)
            message.channel.send(help);
            break;

        case "notice":
            message.channel.send(message.author.toString() + " je sais pas quoi mettre");
            break;

        case "play":

        if (args[1] === "help") {
            message.reply("Usage: !play <lien youtube>");
            return;
        }

            if (!args[1]) {
                message.channel.send("Merci de mettre un lien");
                return;
            }

            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }

            if (!message.member.voiceChannel) {
                message.channel.send("Vous devez être dans un salon vocal");
                return;
            };

            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
                play(connection, message);
                message.channel.send("Musique ajoutée à la queue")
            });
            break;

        case "skip":
            var server = servers[message.guild.id];

            if (server.dispacher) server.dispacher.end();
            break;

        case "stop":
            var server = servers[message.guild.id];

            if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
            message.channel.send("Musique arrêtée");
        break;

        case "pause":
            var server = servers[message.guild.id];

            if (server.dispacher) server.dispacher.pause();
            message.channel.send("La musique est bien en pause");
            break;

        case "resume":
            var server = servers[message.guild.id];

            if (server.dispacher) server.dispacher.resume();
            message.channel.send("La musique a bien repris");
            break;

        case "clear":
            if (!message.member.hasPermission("MANAGE_MESSAGES")) {
                 message.reply("Désolé, `vous n'avez pas la permission d'effectuer cette action`");
                 return
            }

            if (args[1] === "help") {
                message.reply("Usage: `!clear <nombre>`");
                return;
            }

            if (!args[1]) {
            message.channel.send("`Vous devez spécifier le nombre de messages à supprimer`");
            return;
            }

            var clearmsg = (args[1])
            message.channel.bulkDelete(clearmsg).then(() => { 
                message.channel.send(`${(args[1])} Messages supprimé`);
            })
            break;

        case "addrole":
            if (!message.member.hasPermission("MANAGE_ROLES")) {
            message.reply("Désolé, vous n'avez pas la permission d'effectuer cette action");
            return;
            }

            if (args[1] === "help") {
                message.reply("Usage: !addrole <user> <role>");
                return;
            }

            let rMember = message.mentions.members.first();
            if (!rMember) {
            message.reply("Je ne trouve pas cette personne");
            return;
            }

            let role = args.join(" ").slice(22);
            if (!role) {
            message.reply("Merci de préciser le rôle");
            return;
            }

            let gRole = message.guild.roles.find(role => role.name === args[0] );
            if (!gRole) {
            message.reply("Je ne trouve pas ce rôle");
            return;
            }

            if (rMember.role.has(gRole.id)){
                return
            };
            rMember.addRole(gRole).catch(console.error);
        break;

        case "reload":
            if (msg.author.id == tokens.adminID) process.exit();
            break;

        default:
            message.channel.send("Commande invalide");
    }
});

bot.on("ready", function() {
    bot.user.setActivity("^help");
    console.log("Bot is ready");
});

bot.login(process.env.TOKEN);
