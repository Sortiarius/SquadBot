import fs from "fs";
import path from "path";
import Discord from "discord.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Guild from "./models/Guild";

interface Command {
  name: string;
  description: string;
  execute(message: Discord.Message, args: any): void;
}

dotenv.config();

if (!process.env.DB_PATH || !process.env.BOT_TOKEN) {
  throw new Error("Environment variables not properly setup.");
}

const db_path: string = process.env.DB_PATH;
mongoose
  .connect(db_path, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected to database!"));

const client: Discord.Client = new Discord.Client();

const commands: Discord.Collection<string, Command> = new Discord.Collection();

const cmdFs = fs
  .readdirSync(path.join(__dirname, "./command"))
  .filter((f) => f.endsWith(".js") || f.endsWith(".ts"));

for (const file of cmdFs) {
  const cmd = require(path.join(__dirname, "./command/", file));
  commands.set(cmd.default.name, cmd.default);
}

client.once("ready", () => console.log(`Successfully Connected to Discord!`));

client.on("message", async (message) => {
  if (message.author === client.user) {
    return;
  }
  //if(!message.content.startsWith("$") || message.author.bot){ return; }

  if (message.content.split(/ +/)[0] === `<@!${client.user!.id}>`) {
    let args = message.content.split(/ +/);
    if (args[1] != "prefix") {
      return;
    }
    let prefix = args[2];
    if (prefix === undefined) {
      await message.channel.send("Invalid Prefix!");
    }

    if(!message.member!.hasPermission("ADMINISTRATOR")){ return; }
    //console.log(prefix);

    //console.log(message.guild?.id);

    await Guild.findOneAndUpdate(
      { id: message.guild?.id },
      { id: message.guild?.id, prefix: prefix },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const embed = new Discord.MessageEmbed()
      .setTitle(`${message.guild?.name}`)
      .setDescription(`Updated prefix to ${prefix}`)
      .setTimestamp();

    await message.channel.send(embed).catch((err) => console.log(err));

    return;
  }

  let prefix = "$";
  const guild: any = await Guild.findOne({ id: message.guild?.id });
  if (guild) {
    prefix = guild.prefix;
  }

  if (!message.content.startsWith(prefix) || message.author.bot) {
    return;
  }

  const args: any = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  const c = commands.get(command);

  if (!c) {
    return;
  }
  c.execute(message, args);
});

client.login(process.env.BOT_TOKEN);
