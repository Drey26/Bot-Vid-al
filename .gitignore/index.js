const Discord = require("discord.js");
const YTDL = require("ytdl-core");

const PREFIX = "!";

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
    member.guild.channels.find("name", "general").sendMessage(member.toString() + " Bienvenue a toi");
});

bot.on("message", function(message) {
    if (message.author.equals(bot.user)) return;

    if (message.content === "Hello") {
        message.reply("Salut toi");
    }

    if (!message.content.startsWith(PREFIX)) return;

    var args = message.content.substring(PREFIX.length).split(" ");

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
                .addField("Commandes Owner", "pas encore de cmd" )
                .addField("Commandes", "help, notice, play, pause, resume, skip, stop, clear" )
                .setColor(0x00FFFF)
                .setFooter("Bot Videal | aides des commandes")
                .setThumbnail(message.author.avatarURL)
            message.channel.sendEmbed(help);
            break;

        case "notice":
            message.channel.send(message.author.toString() + " je sais pas quoi mettre");
            break;

        case "removerole":
            message.member.removeRole(message.guild.roles.find("name", "Nouveau"));
            break;
        case "deleterole":
            member.guild.roles.find("name", "Nouveau").delete();
            break;

        case "play":
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
                 message.reply("Désolé, vous n'avez pas la permission d'effectuer cette action");
                 return
            }

            if (!args[1]) {
            message.channel.send("Vous devez spécifier le nombre de messages à supprimer");
            return;
            }

            var clearmsg = (args[1])
            message.channel.bulkDelete(clearmsg).then(() => { 
                message.channel.send("messages supprimé");
            })
            break;

        case "addrole":
            if (!message.member.hasPermission("MANAGE_ROLES")) {
            message.reply("Désolé, vous n'avez pas la permission d'effectuer cette action");
            return;
            }

            let rMember = message.guild.member(message.mentions.users.first()) || message.guild.member.get(args[0]);
            if (!rMember) {
            message.reply("Je ne trouve pas cette personne");
            return;
            }

            let role = args.join(" ").slice(22);
            if (!role);
            return message.reply("Merci de préciser le rôle");

            let gRole = message.guild.roles.find("name", role);
            if (!gRole);
            return message.reply("Je ne trouve pas ce rôle");

            if (rMember.role.has(gRole.id));
            await(rMember.addRole(gRole.id));
        break;

        default:
            message.channel.send("commande invalide");
    }
});

bot.on("ready", function() {
    bot.user.setActivity("!help");
    console.log("Bot is ready");
});

// bot.login(process.env.TOKEN);
