// D&D 2024 SRD Conditions
// Based on D&D 2024 SRD v5.2.1

import type { ConditionName } from 'shared';

export interface ConditionInfo {
  name: ConditionName;
  description: string;
}

export const CONDITIONS: ConditionInfo[] = [
  {
    name: 'Blinded',
    description: "Can't see. Auto-fail sight checks. Attack rolls have Disadvantage, attacks against have Advantage.",
  },
  {
    name: 'Charmed',
    description: "Can't attack the charmer. Charmer has Advantage on social checks against you.",
  },
  {
    name: 'Deafened',
    description: "Can't hear. Auto-fail hearing checks.",
  },
  {
    name: 'Frightened',
    description: "Disadvantage on checks and attacks while source of fear is visible. Can't willingly move closer to source.",
  },
  {
    name: 'Grappled',
    description: "Speed is 0. Ends if grappler is Incapacitated or moved out of reach.",
  },
  {
    name: 'Incapacitated',
    description: "Can't take Actions or Reactions.",
  },
  {
    name: 'Invisible',
    description: "Impossible to see without magic. Heavily Obscured. Attacks have Advantage, attacks against have Disadvantage.",
  },
  {
    name: 'Paralyzed',
    description: "Incapacitated. Can't move or speak. Auto-fail STR and DEX saves. Attacks have Advantage. Hits within 5 ft are Critical.",
  },
  {
    name: 'Petrified',
    description: "Transformed to stone. Incapacitated. Resist all damage. Immune to poison and disease.",
  },
  {
    name: 'Poisoned',
    description: "Disadvantage on attack rolls and ability checks.",
  },
  {
    name: 'Prone',
    description: "Can only crawl. Disadvantage on attacks. Attacks within 5 ft have Advantage, beyond have Disadvantage.",
  },
  {
    name: 'Restrained',
    description: "Speed is 0. Attacks have Disadvantage. Attacks against have Advantage. Disadvantage on DEX saves.",
  },
  {
    name: 'Stunned',
    description: "Incapacitated. Can't move. Can speak only falteringly. Auto-fail STR and DEX saves. Attacks have Advantage.",
  },
  {
    name: 'Unconscious',
    description: "Incapacitated. Can't move or speak. Unaware. Drop items, fall Prone. Auto-fail STR and DEX saves. Attacks have Advantage. Hits within 5 ft are Critical.",
  },
];

export const CONDITION_NAMES: ConditionName[] = CONDITIONS.map((c) => c.name);
