import Discord from "discord.js";

export default {
  name: "invite",
  description: "Invite link and information for SquadBot",
  execute: async function (message: Discord.Message, args: any) {
    const Embed = new Discord.MessageEmbed()
      .setColor("2d2d2d")
      .setAuthor(
        "Invite Me",
        "",
        "https://discord.com/api/oauth2/authorize?client_id=622909731043934209&permissions=0&scope=bot"
      )
      .addField(`**Squadron TD**`, "Invite me with the link above.");
    await message.channel.send(Embed);
  },
};
