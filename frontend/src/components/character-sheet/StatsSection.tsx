// Stats Section - Abilities, Skills, Saving Throws
import { Card, NumberInput } from '../shared';
import { getAbilityModifier, getSavingThrowModifier, getSkillModifier, updateCharacter } from '../../services/characters.service';
import type { Character, AbilityName, SkillName } from 'shared';
import './StatsSection.scss';

/**
 * Skill ability mapping (D&D 2024 SRD 5.2)
 */
const SKILL_ABILITIES: Record<SkillName, AbilityName> = {
  'Acrobatics': 'dex',
  'Animal Handling': 'wis',
  'Arcana': 'int',
  'Athletics': 'str',
  'Deception': 'cha',
  'History': 'int',
  'Insight': 'wis',
  'Intimidation': 'cha',
  'Investigation': 'int',
  'Medicine': 'wis',
  'Nature': 'int',
  'Perception': 'wis',
  'Performance': 'cha',
  'Persuasion': 'cha',
  'Religion': 'int',
  'Sleight of Hand': 'dex',
  'Stealth': 'dex',
  'Survival': 'wis',
};

interface StatsSectionProps {
  character: Character;
  gameId: string;
}

const ABILITY_NAMES: Record<AbilityName, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export function StatsSection({ character, gameId }: StatsSectionProps) {
  const handleAbilityChange = async (ability: AbilityName, value: number) => {
    await updateCharacter(gameId, character.id, {
      abilities: {
        ...character.abilities,
        [ability]: Math.max(1, Math.min(30, value)),
      },
    });
  };

  const handleSkillProficiencyToggle = async (skill: SkillName) => {
    const current = character.skills[skill].proficiency;
    const next = current === 2 ? 0 : current + 1;

    await updateCharacter(gameId, character.id, {
      skills: {
        ...character.skills,
        [skill]: { proficiency: next as 0 | 1 | 2 },
      },
    });
  };

  const handleSavingThrowToggle = async (ability: AbilityName) => {
    await updateCharacter(gameId, character.id, {
      savingThrows: {
        ...character.savingThrows,
        [ability]: { proficiency: !character.savingThrows[ability].proficiency },
      },
    });
  };

  return (
    <div className="stats-section">
      <h2 className="section-title">Stats & Abilities</h2>

      <div className="stats-grid">
        {/* Abilities */}
        <Card className="abilities-card">
          <h3 className="card-title">Abilities</h3>
          <div className="abilities-grid">
            {(Object.keys(ABILITY_NAMES) as AbilityName[]).map((ability) => {
              const score = character.abilities[ability];
              const modifier = getAbilityModifier(score);

              return (
                <div key={ability} className="ability-item">
                  <label className="ability-label">{ABILITY_NAMES[ability]}</label>
                  <NumberInput
                    className="ability-input"
                    value={score}
                    onChange={(value) => handleAbilityChange(ability, value)}
                    min={1}
                    max={30}
                    defaultValue={10}
                  />
                  <span className="ability-modifier">
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Saving Throws */}
        <Card className="saves-card">
          <h3 className="card-title">Saving Throws</h3>
          <div className="saves-list">
            {(Object.keys(ABILITY_NAMES) as AbilityName[]).map((ability) => {
              const modifier = getSavingThrowModifier(character, ability);
              const isProficient = character.savingThrows[ability].proficiency;

              return (
                <div
                  key={ability}
                  className={`save-item ${isProficient ? 'proficient' : ''}`}
                  onClick={() => handleSavingThrowToggle(ability)}
                >
                  <span className="save-name">{ABILITY_NAMES[ability]}</span>
                  <span className="save-modifier">
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Skills */}
        <Card className="skills-card">
          <h3 className="card-title">Skills</h3>
          <div className="skills-list">
            {(Object.keys(character.skills) as SkillName[]).map((skill) => {
              const modifier = getSkillModifier(character, skill);
              const proficiency = character.skills[skill].proficiency;

              return (
                <div
                  key={skill}
                  className={`skill-item proficiency-${proficiency}`}
                  onClick={() => handleSkillProficiencyToggle(skill)}
                >
                  <span className="skill-name">
                    {skill} ({SKILL_ABILITIES[skill].toUpperCase()})
                  </span>
                  <span className="skill-modifier">
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
