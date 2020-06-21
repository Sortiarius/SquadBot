import Discord from "discord.js";
import sendData from "../data/sends.json";
import stringSimilarity from "string-similarity";

interface SendList {
  [key: string]: Send;
}

const data: any = sendData;
const Sends: SendList = {};

for (const s in sendData) {
  const send = data[s];
  Sends[s] = {
    name: send.name,
    speed: parseInt(send.speed),
    radius: parseFloat(send.radius),
    id: send.id,
    details: send.details,
    life: parseInt(send.life),
    armor: send.armor,
    cost: parseInt(send.cost),
    bounty: parseInt(send.bounty),
    damage_type: send.damage_type,
    damage_base: parseInt(send.damage_base),
    damage_rand: parseInt(send.damage_rand),
    attack_speed: parseFloat(send.attack_speed),
  };
}

export default {
  name: "send",
  description: "Display information about a certain send.",
  execute: async function (message: Discord.Message, args: any) {
    const sendName = args.join(" ");
    const bestMatch = stringSimilarity.findBestMatch(
      sendName,
      Object.keys(Sends)
    ).bestMatch;
    if (bestMatch.rating <= 0.3) {
      return;
    }
    const send: Send = Sends[bestMatch.target];

    const Embed: Discord.MessageEmbed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setAuthor(
        `${send.name} (${send.cost})`,
        "https://cdn.discordapp.com/icons/543294798430339102/3fa3c167af9a9f40a1789c4dea3165d8.png",
        ""
      );

    if (!send.damage_type) {
      Embed.addField("**Send**", `*${send.armor}*`);
    } else {
      Embed.addField("**Send**", `*${send.damage_type}, ${send.armor}*`);
    }

    Embed.addField("**Description**", send.details);

    const max = Number(send.damage_base) + Number(send.damage_rand);
    Embed.addField("**Damage**", `${send.damage_base}-${max.toString()}`, true);
    Embed.addField("**Attack Speed**", `${send.attack_speed}`, true);
    Embed.addField("\u200b", "\u200b", true);

    Embed.addField("**Bounty**", `${send.bounty}`, true);
    Embed.addField("**HP**", `${send.life}`, true);
    Embed.addField("\u200b", "\u200b", true);

    Embed.addField("**Speed**", `${send.speed}`, true);
    Embed.addField("**Radius**", `${send.radius}`, true);
    Embed.addField("\u200b", "\u200b", true);

    await message.channel.send(Embed);
  },
};
