
// Character Sheet Page - Full D&D 2024 character sheet
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCharacter } from '../hooks/useCharacter';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import {
  getAbilityModifier,
  getSavingThrowModifier,
  getSkillModifier,
  updateCharacter,
} from '../services/characters.service';
import type { Character, AbilityName, SkillName } from 'shared';
import './CharacterSheetPage.css';

// Skill ability mapping (D&D 2024 SRD 5.2)
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

const ABILITY_NAMES: Record<AbilityName, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

const ABILITY_ORDER: AbilityName[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

// Group skills by ability
function getSkillsByAbility(): Record<AbilityName, SkillName[]> {
  const grouped: Record<AbilityName, SkillName[]> = {
    str: [],
    dex: [],
    con: [],
    int: [],
    wis: [],
    cha: [],
  };

  (Object.keys(SKILL_ABILITIES) as SkillName[]).forEach((skill) => {
    grouped[SKILL_ABILITIES[skill]].push(skill);
  });

  // Sort each group alphabetically
  Object.keys(grouped).forEach((ability) => {
    grouped[ability as AbilityName].sort((a, b) => a.localeCompare(b));
  });

  return grouped;
}

const SKILLS_BY_ABILITY = getSkillsByAbility();

export default function CharacterSheetPage() {
  const navigate = useNavigate();
  const { gameId, characterId } = useParams<{ gameId: string; characterId: string }>();
  const { character, loading } = useCharacter(gameId || null, characterId || null);
  const [headerExpanded, setHeaderExpanded] = useState(true);

  const handleBack = () => {
    navigate(`/games/${gameId}`);
  };

  if (loading) {
    return (
        <div className="character-sheet-page">
          <div className="character-sheet-loading">
            <LoadingSpinner size="large" />
            <p>Loading character...</p>
          </div>
        </div>
    );
  }

  if (!character) {
    return (
        <div className="character-sheet-page">
          <div className="character-sheet-error">
            <h2>Character Not Found</h2>
            <Button onClick={handleBack}>Back to Characters</Button>
          </div>
        </div>
    );
  }

  return (
      <div className="character-sheet-page">
        <CharacterHeader
            character={character}
            gameId={gameId!}
            expanded={headerExpanded}
            onToggleExpand={() => setHeaderExpanded(!headerExpanded)}
            onBack={handleBack}
        />

        <div className="character-sheet-content">
          <AbilitiesAndSkillsSection character={character} gameId={gameId!} />
        </div>
      </div>
  );
}

// ==================== HEADER ====================

interface CharacterHeaderProps {
  character: Character;
  gameId: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onBack: () => void;
}

function CharacterHeader({ character, gameId, expanded, onToggleExpand, onBack }: CharacterHeaderProps) {
  const handleHpChange = async (field: 'current' | 'max' | 'temp', delta: number) => {
    const newValue = Math.max(0, character.hp[field] + delta);
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, [field]: newValue },
    });
  };

  const initiativeModifier = getAbilityModifier(character.abilities.dex);

  return (
      <div className="cs-header">
        {/* Top row: Back button, Name, Settings */}
        <div className="cs-header-top">
          <Button variant="secondary" onClick={onBack} className="cs-back-btn">
            ← Back
          </Button>
          <div className="cs-header-title">
            <h1 className="cs-name">{character.name}</h1>
            <p className="cs-subtitle">{character.race} — {character.class}</p>
          </div>
        </div>

        {/* Level & XP bar */}
        <div className="cs-level-bar">
          <div className="cs-level-label">{character.level} Level</div>
          <div className="cs-xp-bar">
            <div className="cs-xp-fill" style={{ width: '0%' }}></div>
            <span className="cs-xp-text">0/300</span>
          </div>
          <div className="cs-prof-bonus">{character.proficiencyBonus}</div>
        </div>

        {/* Quick stats row */}
        <div className="cs-quick-stats">
          <div className="cs-stat-box">
            <div className="cs-stat-value cs-bordered">{character.ac}</div>
            <div className="cs-stat-sub">{character.speed}</div>
            <div className="cs-stat-label">Speed</div>
          </div>

          <div className="cs-hp-box">
            <button className="cs-hp-btn minus" onClick={() => handleHpChange('current', -1)}>−</button>
            <div className="cs-hp-display">
              <span className="cs-hp-current">{character.hp.current}</span>
              <span className="cs-hp-separator">/</span>
              <span className="cs-hp-max">{character.hp.max}</span>
            </div>
            <button className="cs-hp-btn plus" onClick={() => handleHpChange('current', 1)}>+</button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
            <div className="cs-expanded-stats">
              <div className="cs-mini-stat">
                <div className="cs-mini-label">Inspiration</div>
                <div className="cs-mini-value">—</div>
              </div>
              <div className="cs-mini-stat">
                <div className="cs-mini-label">Conditions</div>
                <div className="cs-mini-value">0</div>
              </div>
              <div className="cs-mini-stat">
                <div className="cs-mini-label">Exhaustion</div>
                <div className="cs-mini-value">0</div>
              </div>
              <div className="cs-mini-stat">
                <div className="cs-mini-label">Initiative</div>
                <div className="cs-mini-value">
                  {initiativeModifier >= 0 ? '+' : ''}{initiativeModifier}
                </div>
              </div>
            </div>
        )}

        {/* Collapse toggle */}
        <button className="cs-collapse-btn" onClick={onToggleExpand}>
          {expanded ? 'Collapse ▲' : 'Expand ▼'}
        </button>
      </div>
  );
}

// ==================== ABILITIES & SKILLS SECTION ====================

interface AbilitiesSkillsProps {
  character: Character;
  gameId: string;
}

function AbilitiesAndSkillsSection({ character, gameId }: AbilitiesSkillsProps) {
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
      <div className="cs-abilities-skills">
        <div className="cs-section-header">
          <h2>Abilities & Skills</h2>
          <button className="cs-section-menu">≡</button>
        </div>

        {ABILITY_ORDER.map((ability) => (
            <AbilityBlock
                key={ability}
                ability={ability}
                character={character}
                onAbilityChange={handleAbilityChange}
                onSavingThrowToggle={handleSavingThrowToggle}
                onSkillProficiencyToggle={handleSkillProficiencyToggle}
            />
        ))}
      </div>
  );
}

// ==================== ABILITY BLOCK ====================

interface AbilityBlockProps {
  ability: AbilityName;
  character: Character;
  onAbilityChange: (ability: AbilityName, value: number) => void;
  onSavingThrowToggle: (ability: AbilityName) => void;
  onSkillProficiencyToggle: (skill: SkillName) => void;
}

function AbilityBlock({
                        ability,
                        character,
                        onAbilityChange,
                        onSavingThrowToggle,
                        onSkillProficiencyToggle,
                      }: AbilityBlockProps) {
  const score = character.abilities[ability];
  const modifier = getAbilityModifier(score);
  const saveModifier = getSavingThrowModifier(character, ability);
  const saveProficient = character.savingThrows[ability].proficiency;
  const skills = SKILLS_BY_ABILITY[ability];

  return (
      <div className="cs-ability-block">
        {/* Ability Header */}
        <div className="cs-ability-header">
          <h3 className="cs-ability-name">{ABILITY_NAMES[ability].toUpperCase()}</h3>
          <input
              type="number"
              className="cs-ability-score"
              value={score}
              onChange={(e) => onAbilityChange(ability, parseInt(e.target.value) || 10)}
              min="1"
              max="30"
          />
        </div>

        {/* Check & Saving Throw row */}
        <div className="cs-ability-modifiers">
          <div className="cs-modifier-box">
            <span className="cs-modifier-label">Check</span>
            <span className="cs-modifier-value">
            {modifier >= 0 ? '+' : ''}{modifier}
          </span>
          </div>
          <div
              className={`cs-modifier-box cs-save ${saveProficient ? 'proficient' : ''}`}
              onClick={() => onSavingThrowToggle(ability)}
          >
            <span className="cs-modifier-label">Saving Throw</span>
            <span className="cs-modifier-value">
            {saveModifier >= 0 ? '+' : ''}{saveModifier}
          </span>
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
            <div className="cs-skills-list">
              {skills.map((skill) => {
                const skillMod = getSkillModifier(character, skill);
                const proficiency = character.skills[skill].proficiency;

                return (
                    <div
                        key={skill}
                        className={`cs-skill-row proficiency-${proficiency}`}
                        onClick={() => onSkillProficiencyToggle(skill)}
                    >
                      <div className="cs-skill-indicator">
                        {proficiency === 2 ? '◉' : proficiency === 1 ? '●' : '○'}
                      </div>
                      <span className="cs-skill-name">{skill}</span>
                      <span className="cs-skill-modifier">
                  {skillMod >= 0 ? '+' : ''}{skillMod}
                </span>
                    </div>
                );
              })}
            </div>
        )}
      </div>
  );
}