import Discord from "discord.js";
import waveData from "../data/waves.json";
import stringSimilarity from "string-similarity";
import { round } from "../util/attackspeed";

interface WaveList {
  [key: string]: Wave;
}

const data: any = waveData;
const Waves: WaveList = {};

for (const w in waveData) {
  const wave = data[w];
  Waves[w] = {
    name: wave.name,
    wave: parseInt(wave.wave),
    id: wave.id,
    speed: parseInt(wave.speed),
    radius: parseInt(wave.radius),
    life: parseInt(wave.life),
    armor: wave.armor,
    bounty: parseInt(wave.bounty),
    damage_type: wave.damage_type,
    damage_base: parseInt(wave.damage_base),
    damage_rand: parseInt(wave.damage_rand),
    attack_speed: parseFloat(wave.attack_speed),
    count: parseInt(wave.count),
  };
}

function isInteger(value: any) {
  return /^\d+$/.test(value);
}

export default {
  name: "wave",
  description: "Display information about a certain wave.",
  execute: async function (message: Discord.Message, args: any) {
    let Wave: Wave;
    let Adrenaline: Boolean = false;
    if (
      args[args.length - 1] &&
      args[args.length - 1].toLowerCase() === "adrenaline"
    ) {
      Adrenaline = true;
    }
    if (isInteger(args[0])) {
      let pos = "Fat Zergling";
      for (const key in Waves) {
        if (Waves[key].wave === parseInt(args[0])) {
          pos = key;
          break;
        }
      }

      if (!pos && parseInt(args[0]) <= 31) {
        return;
      }
      Wave = Waves[pos];

      if (parseInt(args[0]) > 31) {
        Wave = Object.assign({}, Waves["terratron"]);
        Wave.wave = parseInt(args[0]);
        const bonusWaves = parseInt(args[0]) - 31;
        if (
          !Wave.count ||
          !Wave.damage_base ||
          !Wave.life ||
          !Wave.attack_speed
        ) {
          return;
        }
        Wave.count = Wave.count + bonusWaves;
        Wave.damage_base += 2 * bonusWaves;
        Wave.life += 267 * bonusWaves;
        Wave.attack_speed = round(
          Wave.attack_speed / (1 + (1 - 1 / Math.pow(1.05, bonusWaves))),
          2
        );
      }
    } else {
      const waveName = args.join(" ");
      const bestMatch = stringSimilarity.findBestMatch(
        waveName,
        Object.keys(Waves)
      ).bestMatch;
      if (bestMatch.rating <= 0.3) {
        return;
      }
      Wave = Waves[bestMatch.target];
    }

    if (!Wave.wave) {
      return;
    }
    const adrBonusHP = 1 + 0.02 * Wave.wave;
    const adrBonusDMG = 1 + 0.02 * Wave.wave;
    const adrBonusAS = 1 - 1 / ((1 + 0.01) ^ Wave.wave);

    const waveNameAdr = `${Wave.name} (Adrenaline)`;

    const Embed: Discord.MessageEmbed = new Discord.MessageEmbed()
      .setColor("#bba975")
      .setAuthor(
        `${Adrenaline ? waveNameAdr : Wave.name}`,
        "https://cdn.discordapp.com/icons/543294798430339102/3fa3c167af9a9f40a1789c4dea3165d8.png",
        ""
      );

    if (!Wave.damage_type) {
      Embed.addField(`**Wave ${Wave.wave}**`, `*${Wave.armor}*`);
    } else if (Wave.count === 1) {
      Embed.addField(
        `**Wave ${Wave.wave}**`,
        `*${Wave.damage_type}, ${Wave.armor}, **Boss***`
      );
    } else {
      Embed.addField(
        `**Wave ${Wave.wave}**`,
        `*${Wave.damage_type}, ${Wave.armor}*`
      );
    }

    if (!Wave.damage_base || !Wave.life || !Wave.attack_speed) {
      return;
    }

    const max = Number(Wave.damage_base) + Number(Wave.damage_rand);
    const waveDmg = `${Wave.damage_base?.toString()}-${max.toString()}`;

    const adrBaseDmg = Math.round(
      Number(Wave.damage_base) * Number(adrBonusDMG)
    );
    const adrMaxDmg = Math.round(Number(max) * Number(adrBonusDMG));

    const waveDmgAdr = `${adrBaseDmg.toString()}-${adrMaxDmg.toString()}`;

    Embed.addField(
      `**Damage**`,
      `*${Adrenaline ? waveDmgAdr : waveDmg}*`,
      true
    );
    const adrAttackSpeed = round(
      Wave.attack_speed / (1 + (1 - 1 / Math.pow(1.01, Wave.wave))),
      2
    );
    Embed.addField(
      "" + "**Attack Speed**",
      `${Adrenaline ? adrAttackSpeed : Wave.attack_speed}`,
      true
    );
    Embed.addField("\u200b", "\u200b", true);

    Embed.addField("**Bounty**", `${Wave.bounty ? Wave.bounty : 0}`, true);
    Embed.addField(
      "**HP**",
      `${Adrenaline ? Math.round(Wave.life * adrBonusHP) : Wave.life}`,
      true
    );
    Embed.addField("\u200b", "\u200b", true);

    Embed.addField(`**Count (1x)**`, `${Wave.count}`, true);
    Embed.addField(
      `**Count (3x)**`,
      `${Wave.count ? Wave.count * 3 : 0}`,
      true
    );
    Embed.addField("\u200b", "\u200b", true);

    Embed.addField("**Speed**", `${Wave.speed}`, true);
    Embed.addField("**Radius**", `${Wave.radius}`, true);
    Embed.addField("\u200b", "\u200b", true);

    await message.channel.send(Embed);
  },
};
