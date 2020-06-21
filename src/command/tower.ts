import Discord from "discord.js";
import towerData from "../data/units.json";
import stringSimilarity from "string-similarity";
import { attackSpeedAdd, round } from "../util/attackspeed";

interface TowerList {
  [key: string]: Tower;
}

const data: any = towerData;

const Towers: TowerList = {};

for (const t in towerData) {
  const tower = data[t];
  Towers[t] = {
    name: tower.name,
    abilities: tower.abilities,
    armor: tower.armor,
    life: parseInt(tower.life),
    supply: tower.supply,
    cost: parseInt(tower.cost),
    damage_type: tower.damage_type,
    damage_base: tower.damage_base,
    damage_rand: tower.damage_rand,
    attack_speed: parseFloat(tower.attack_speed),
    builder: tower.builder,
    parent_cost: parseInt(tower.parent_cost),
    parent_supply: parseInt(tower.parent_supply),
    parent_name: tower.parent_name,
  };
}

export default {
  name: "tower",
  description: "Gets information about a Tower",
  execute: async function (message: Discord.Message, args: any) {
    const towerName = args
      .filter((arg: string) => !arg.startsWith("+"))
      .join(" ");
    const bestMatch = stringSimilarity.findBestMatch(
      towerName,
      Object.keys(Towers)
    ).bestMatch;
    if (bestMatch.rating <= 0.3) {
      return;
    }
    let tower: Tower = Towers[bestMatch.target];

    const buffList = args.filter((arg: string) => arg.startsWith("+"));
    if (buffList.length >= 1) {
      tower = Object.assign({}, Towers[bestMatch.target]);
      tower.buffs = [];
      buffList.forEach((buff: string) => {
        const buffType = buff.slice(1).toLowerCase();
        if (!tower.buffs) {
          return;
        }
        if (buffType === "astromech" && !tower.buffs.includes("Astromech")) {
          tower.buffs.push("Astromech");
          if (tower.attack_speed) {
            tower.attack_speed = round(
              attackSpeedAdd(tower.attack_speed, 0.1, 1),
              2
            );
          }
          if (tower.damage_base) {
            tower.damage_base = Number(tower.damage_base) + Number(5);
            tower.damage_base = round(tower.damage_base * 1.1, 0);
          }
          if (tower.damage_rand) {
            tower.damage_rand = round(tower.damage_rand * 1.1, 0);
          }
          if (tower.life) {
            tower.life += 300;
          }
          if (tower.cost) {
            tower.cost += 105;
          }
        }
        if (buffType === "vocant" && !tower.buffs.includes("Vocant de Furor")) {
          tower.buffs.push("Vocant de Furor");
          if (tower.attack_speed) {
            tower.attack_speed = round(
              attackSpeedAdd(tower.attack_speed, 0.3, 1),
              2
            );
          }
        }
        if (buffType === "requiem" && !tower.buffs.includes("Requiem")) {
          tower.buffs.push("Requiem");
          if (tower.attack_speed) {
            tower.attack_speed = round(
              attackSpeedAdd(tower.attack_speed, 0.32, 1),
              2
            );
          }
          if (tower.damage_base) {
            tower.damage_base = Number(tower.damage_base) + Number(24);
            tower.damage_base = round(tower.damage_base * 1.16, 0);
          }
          if (tower.damage_rand) {
            tower.damage_rand = round(tower.damage_rand * 1.16, 0);
          }
        }
        if (buffType === "leadership" && !tower.buffs.includes("Leadership")) {
          tower.buffs.push("Leadership");
          if (tower.damage_base) {
            tower.damage_base = round(tower.damage_base * 1.07, 0);
          }
          if (tower.damage_rand) {
            tower.damage_rand = round(tower.damage_rand * 1.07, 0);
          }
        }
        if (
          buffType === "superiority" &&
          !tower.buffs.includes("Superiority")
        ) {
          tower.buffs.push("Superiority");
          if (tower.damage_base) {
            tower.damage_base = round(tower.damage_base * 1.12, 0);
          }
          if (tower.damage_rand) {
            tower.damage_rand = round(tower.damage_rand * 1.12, 0);
          }
        }
        if (
          buffType === "adrenalinerush" &&
          !tower.buffs.includes("Adrenaline Rush")
        ) {
          tower.buffs.push("Adrenaline Rush");
          if (tower.attack_speed) {
            tower.attack_speed = round(
              attackSpeedAdd(tower.attack_speed, 0.18, 1),
              2
            );
          }
        }
      });
    }

    let tN = `${tower.name}`;
    if (tower.buffs) {
      tower.buffs.forEach((buff: string) => {
        tN += ` (${buff})`;
      });
    }
    const Embed: Discord.MessageEmbed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setAuthor(
        `${tN}`,
        "https://cdn.discordapp.com/icons/543294798430339102/3fa3c167af9a9f40a1789c4dea3165d8.png",
        ""
      );

    if (!tower.damage_type) {
      Embed.addField(`**Tower Lookup**`, `*${tower.armor}*`);
    } else {
      Embed.addField(
        `**Tower Lookup**`,
        `*${tower.damage_type}, ${tower.armor}*`
      );
    }

    if (tower.damage_base && tower.damage_rand) {
      let max = Number(tower.damage_base) + Number(tower.damage_rand);
      Embed.addField(
        "**Damage**",
        `${tower.damage_base.toString()}-${max.toString()}`,
        true
      );
    } else if (tower.damage_base && !tower.damage_rand) {
      Embed.addField("**Damage**", `${tower.damage_base.toString()}}`, true);
    } else {
      Embed.addField("**Damage**", "*None*", true);
    }

    if (tower.attack_speed) {
      Embed.addField(
        "**Attack Speed**",
        `${tower.attack_speed.toString()}`,
        true
      );
    }
    Embed.addField("\u200b", "\u200b", true);

    Embed.addField("**Cost**", tower.cost, true);
    if (tower.parent_cost && tower.cost) {
      const TotalCost: number = tower.cost + tower.parent_cost;
      Embed.addField("**Total Cost**", TotalCost.toString(), true);
    } else {
      Embed.addField("\u200b", "\u200b", true);
    }
    Embed.addField("\u200b", "\u200b", true);

    if (tower.supply) {
      Embed.addField("**Supply**", tower.supply, true);
    } else {
      Embed.addField("**Supply**", "0", true);
    }
    if (tower.supply && tower.parent_supply) {
      const total: number = tower.supply + tower.parent_supply;
      Embed.addField("**Total Supply**", total.toString(), true);
    } else {
      if (!tower.supply && tower.parent_supply) {
        Embed.addField(
          "**Total Supply**",
          tower.parent_supply.toString(),
          true
        );
      } else {
        Embed.addField("\u200b", "\u200b", true);
      }
    }
    Embed.addField("\u200b", "\u200b", true);

    Embed.addField("**HP**", tower.life, true);
    Embed.addField("**Builder**", tower.builder, true);
    Embed.addField("\u200b", "\u200b", true);

    let abilities: string = "";
    let first = true;
    // @ts-ignore
    tower.abilities.forEach((el: any) => {
      if (first) {
        first = false;
      } else {
        abilities += "\n\n";
      }
      abilities += `**${el.name}: ** ${el.description}`;
    });
    if (tower.abilities && tower.abilities.length >= 1) {
      Embed.addField("**Abilities:**", abilities);
    }

    await message.channel.send(Embed);
  },
};
