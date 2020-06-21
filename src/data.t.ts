declare interface Sends {
    name?:         string;
    speed?:        string;
    radius?:       string;
    id?:           string;
    details?:      string;
    life?:         string;
    armor?:        Armor;
    cost?:         string;
    bounty?:       string;
    damage_type?:  Damage;
    damage_base?:  string;
    damage_rand?:  string;
    attack_speed?: string;
}

declare enum Armor {
    Armored = "Armored",
    Biological = "Biological",
    Light = "Light",
    Massive = "Massive",
    Mechanical = "Mechanical",
}

declare enum Damage {
    Normal = "Normal",
    Piercing = "Piercing",
    Magic = "Magic",
    Siege = "Siege",
    Chaos = "Chaos"
}

declare interface Wave {
    name?: string
    wave?: number
    id?: string,
    speed?: number,
    radius?: number,
    life?: number,
    armor?: Armor,
    bounty?: number,
    damage_type?: Damage,
    damage_base?: number,
    damage_rand?: number,
    attack_speed?: number,
    count?: number
}

declare interface Tower {
    name?: string,
    abilities?: [
        {
            name: string,
            description: string
        }
    ],
    armor?: Armor,
    life?: number,
    supply?: number,
    cost?: number,
    damage_type?: Damage,
    damage_base?: number,
    damage_rand?: number,
    attack_speed?: number,
    builder?: string,
    parent_cost?: number,
    parent_supply?: number,
    parent_name?: string
}