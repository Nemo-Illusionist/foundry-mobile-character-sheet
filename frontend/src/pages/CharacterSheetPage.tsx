
// Character Sheet Page - Full D&D 2024 character sheet
import { useState, useEffect } from 'react';
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

// Calculate proficiency bonus based on level (D&D 2024)
function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

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
        />

        <div className="character-sheet-content">
          <AbilitiesAndSkillsSection character={character} gameId={gameId!} />
        </div>
      </div>
  );
}

// ==================== SETTINGS MODAL ====================

interface SettingsModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

function SettingsModal({ character, gameId, onClose }: SettingsModalProps) {
  const [formData, setFormData] = useState({
    name: character.name,
    race: character.race,
    class: character.class,
    subclass: character.subclass || '',
    ac: character.ac,
    speed: character.speed,
  });

  const handleSave = async () => {
    await updateCharacter(gameId, character.id, {
      name: formData.name,
      race: formData.race,
      class: formData.class,
      subclass: formData.subclass,
      ac: formData.ac,
      speed: formData.speed,
    });
    onClose();
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-header">
          <h2>Character Settings</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          <div className="cs-form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Background</label>
            <input
              type="text"
              value={formData.race}
              onChange={(e) => setFormData({ ...formData, race: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Class</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Subclass</label>
            <input
              type="text"
              value={formData.subclass}
              onChange={(e) => setFormData({ ...formData, subclass: e.target.value })}
            />
          </div>

          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Armor Class</label>
              <input
                type="number"
                value={formData.ac}
                onChange={(e) => setFormData({ ...formData, ac: parseInt(e.target.value) || 10 })}
              />
            </div>

            <div className="cs-form-group">
              <label>Speed</label>
              <input
                type="number"
                value={formData.speed}
                onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) || 30 })}
              />
            </div>
          </div>
        </div>

        <div className="cs-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}

// ==================== LEVEL/XP MODAL ====================

interface LevelXPModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

// XP thresholds for each level (D&D 2024 SRD)
const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

function LevelXPModal({ character, gameId, onClose }: LevelXPModalProps) {
  const [currentXP, setCurrentXP] = useState(character.experience || 0);
  const [gainXPInput, setGainXPInput] = useState('');
  const [message, setMessage] = useState('');

  // Sync currentXP with character.experience when it changes
  useEffect(() => {
    setCurrentXP(character.experience || 0);
  }, [character.experience]);

  const calculateLevel = (xp: number): number => {
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= XP_THRESHOLDS[i]) {
        return Math.min(i + 1, 20);
      }
    }
    return 1;
  };

  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = currentLevel < 20 ? XP_THRESHOLDS[currentLevel] : null;

  const handleLevelUp = async () => {
    if (character.level >= 20) {
      setMessage('Maximum level reached!');
      return;
    }

    const newLevel = character.level + 1;
    const newXP = XP_THRESHOLDS[newLevel - 1] || 0;

    await updateCharacter(gameId, character.id, {
      level: newLevel,
      experience: newXP,
    });

    setCurrentXP(newXP);
    setMessage(`Level increased to ${newLevel}!`);
  };

  const handleXPChange = async () => {
    await updateCharacter(gameId, character.id, {
      experience: currentXP,
      level: currentLevel,
    });
    setMessage('Experience updated!');
  };

  const handleGainXP = async () => {
    const gainedXP = parseInt(gainXPInput) || 0;
    if (gainedXP <= 0) return;

    const newXP = currentXP + gainedXP;
    const oldLevel = currentLevel;
    const newLevel = calculateLevel(newXP);

    setCurrentXP(newXP);
    setGainXPInput('');

    await updateCharacter(gameId, character.id, {
      experience: newXP,
      level: newLevel,
    });

    if (newLevel > oldLevel) {
      setMessage(`Gained ${gainedXP} XP! Level increased to ${newLevel}!`);
    } else {
      setMessage(`Gained ${gainedXP} XP!`);
    }
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-header">
          <h2>Level & Experience</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {/* Current Level */}
          <div className="cs-level-section">
            <div className="cs-level-display">
              <span className="cs-level-current">Level {character.level}</span>
              {character.level < 20 && (
                <button className="cs-level-up-btn" onClick={handleLevelUp}>Level Up</button>
              )}
            </div>
          </div>

          {/* Current XP */}
          <div className="cs-form-group">
            <label>Current Experience</label>
            <div className="cs-xp-input-row">
              <input
                type="number"
                value={currentXP}
                onChange={(e) => setCurrentXP(parseInt(e.target.value) || 0)}
              />
              <Button variant="secondary" onClick={handleXPChange}>Update</Button>
            </div>
            {nextLevelXP && (
              <small className="cs-xp-info">
                {nextLevelXP - currentXP} XP until level {currentLevel + 1}
              </small>
            )}
          </div>

          {/* Gain XP */}
          <div className="cs-form-group">
            <label>Gain Experience</label>
            <div className="cs-xp-input-row">
              <input
                type="number"
                placeholder="Enter XP gained"
                value={gainXPInput}
                onChange={(e) => setGainXPInput(e.target.value)}
              />
              <Button onClick={handleGainXP}>Add</Button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="cs-message">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== HP COMPONENTS ====================

interface HPBoxDesktopProps {
  character: Character;
  gameId: string;
  onOpenModal: () => void;
}

function HPBoxDesktop({ character, gameId, onOpenModal }: HPBoxDesktopProps) {
  const [healAmount, setHealAmount] = useState('');

  const effectiveMaxHP = character.hp.max + (character.hpBonus || 0);

  const handleDamage = async () => {
    const amount = parseInt(healAmount) || 0;
    if (amount <= 0) return;

    let remaining = amount;
    let newTemp = character.hp.temp;
    let newCurrent = character.hp.current;

    // Apply to temp HP first
    if (newTemp > 0) {
      if (newTemp >= remaining) {
        newTemp -= remaining;
        remaining = 0;
      } else {
        remaining -= newTemp;
        newTemp = 0;
      }
    }

    // Apply remaining to current HP
    if (remaining > 0) {
      newCurrent = Math.max(0, newCurrent - remaining);
    }

    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, current: newCurrent, temp: newTemp },
    });
    setHealAmount('');
  };

  const handleHeal = async () => {
    const amount = parseInt(healAmount) || 0;
    if (amount <= 0) return;

    const newCurrent = Math.min(effectiveMaxHP, character.hp.current + amount);
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, current: newCurrent },
      deathSaves: { successes: 0, failures: 0 }, // Clear death saves on heal
    });
    setHealAmount('');
  };

  const handleTempHPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, temp: Math.max(0, value) },
    });
  };

  const handleDeathSaveClick = async (type: 'success' | 'failure', index: number) => {
    const current = character.deathSaves || { successes: 0, failures: 0 };
    const currentCount = type === 'success' ? current.successes : current.failures;
    const newCount = currentCount === index + 1 ? index : index + 1;

    await updateCharacter(gameId, character.id, {
      deathSaves: {
        ...current,
        [type === 'success' ? 'successes' : 'failures']: newCount,
      },
    });
  };

  const isDead = character.hp.current === 0;
  const deathSaves = character.deathSaves || { successes: 0, failures: 0 };

  return (
    <div className="cs-hp-box-desktop" onClick={onOpenModal} style={{ cursor: 'pointer' }}>
      {/* Column 1: Heal/Input/Damage group - spans 2 rows */}
      <div className="cs-hp-vertical-group">
        <button
          className="cs-hp-btn-small heal"
          onClick={(e) => {
            e.stopPropagation();
            handleHeal();
          }}
        >
          Heal
        </button>
        <input
          type="number"
          className="cs-hp-input-small"
          value={healAmount}
          onChange={(e) => setHealAmount(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="0"
        />
        <button
          className="cs-hp-btn-small damage"
          onClick={(e) => {
            e.stopPropagation();
            handleDamage();
          }}
        >
          Damage
        </button>
      </div>

      {isDead ? (
        <div className="cs-death-saves-both-rows">
          {/* Row 1: Success circles (horizontal) */}
          <div className="cs-death-saves-circles-horizontal">
            {[0, 1, 2].map((i) => (
              <div
                key={`success-${i}`}
                className={`cs-death-save-circle cs-success ${i < deathSaves.successes ? 'filled' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeathSaveClick('success', i);
                }}
              />
            ))}
          </div>

          {/* Row 2: Failure circles (horizontal) */}
          <div className="cs-death-saves-circles-horizontal">
            {[0, 1, 2].map((i) => (
              <div
                key={`failure-${i}`}
                className={`cs-death-save-circle cs-failure ${i < deathSaves.failures ? 'filled' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeathSaveClick('failure', i);
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Column 2, Row 1: Hit Points label */}
          <div className="cs-hp-label">Hit Points</div>

          {/* Column 3, Row 1: TEMP label */}
          <div className="cs-hp-label-temp">TEMP</div>

          {/* Column 2, Row 2: Current/Max HP display */}
          <div className="cs-hp-display-large">
            <span className="cs-hp-current">{character.hp.current}</span>
            <span className="cs-hp-separator">/</span>
            <span className="cs-hp-max">{effectiveMaxHP}</span>
          </div>

          {/* Column 3, Row 2: Temp HP input */}
          <input
            type="number"
            className="cs-hp-input-small"
            value={character.hp.temp}
            onChange={(e) => {
              e.stopPropagation();
              handleTempHPChange(e);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </>
      )}
    </div>
  );
}

interface HPBoxMobileProps {
  character: Character;
  onClick: () => void;
}

function HPBoxMobile({ character, onClick }: HPBoxMobileProps) {
  const effectiveMaxHP = character.hp.max + (character.hpBonus || 0);
  const isDead = character.hp.current === 0;
  const deathSaves = character.deathSaves || { successes: 0, failures: 0 };

  if (isDead) {
    return (
      <div className="cs-hp-box-mobile cs-death-saves-mobile" onClick={onClick}>
        <div className="cs-death-saves-mobile-row">
          <div className="cs-death-saves-circles-mobile">
            {[0, 1, 2].map((i) => (
              <div
                key={`success-${i}`}
                className={`cs-death-save-circle-mobile cs-success ${i < deathSaves.successes ? 'filled' : ''}`}
              />
            ))}
          </div>
        </div>
        <div className="cs-death-saves-mobile-row">
          <div className="cs-death-saves-circles-mobile">
            {[0, 1, 2].map((i) => (
              <div
                key={`failure-${i}`}
                className={`cs-death-save-circle-mobile cs-failure ${i < deathSaves.failures ? 'filled' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-hp-box-mobile" onClick={onClick}>
      <div className="cs-hp-mobile-text">
        {character.hp.current}/{effectiveMaxHP}
        {character.hp.temp > 0 && ` (+${character.hp.temp})`}
      </div>
      <div className="cs-hp-mobile-label">HP</div>
    </div>
  );
}

interface HPModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

function HPModal({ character, gameId, onClose }: HPModalProps) {
  const [currentHP, setCurrentHP] = useState(character.hp.current);
  const [tempHP, setTempHP] = useState(character.hp.temp);
  const [amount, setAmount] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [maxHP, setMaxHP] = useState(character.hp.max);
  const [hpBonus, setHpBonus] = useState(character.hpBonus || 0);
  const [hitDice, setHitDice] = useState(character.hitDice || 'd8');

  const effectiveMaxHP = maxHP + hpBonus;

  const handleDamage = async () => {
    const dmg = parseInt(amount) || 0;
    if (dmg <= 0) return;

    let remaining = dmg;
    let newTemp = tempHP;
    let newCurrent = currentHP;

    if (newTemp > 0) {
      if (newTemp >= remaining) {
        newTemp -= remaining;
        remaining = 0;
      } else {
        remaining -= newTemp;
        newTemp = 0;
      }
    }

    if (remaining > 0) {
      newCurrent = Math.max(0, newCurrent - remaining);
    }

    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, current: newCurrent, temp: newTemp },
    });
    setCurrentHP(newCurrent);
    setTempHP(newTemp);
    setAmount('');
  };

  const handleHeal = async () => {
    const heal = parseInt(amount) || 0;
    if (heal <= 0) return;

    const newCurrent = Math.min(effectiveMaxHP, currentHP + heal);
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, current: newCurrent },
      deathSaves: { successes: 0, failures: 0 },
    });
    setCurrentHP(newCurrent);
    setAmount('');
  };

  const handleUpdateMaxHP = async (newMax: number) => {
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, max: newMax },
    });
  };

  const handleUpdateHPBonus = async (newBonus: number) => {
    await updateCharacter(gameId, character.id, {
      hpBonus: newBonus,
    });
  };

  const handleUpdateHitDice = async (newHitDice: string) => {
    await updateCharacter(gameId, character.id, {
      hitDice: newHitDice,
    });
  };

  const handleUpdateCurrentHP = async (newCurrent: number) => {
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, current: newCurrent },
    });
  };

  const handleUpdateTempHP = async (newTemp: number) => {
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, temp: newTemp },
    });
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-header">
          <h2>Hit Points</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          <div className="cs-hp-modal-main">
            <div className="cs-hp-modal-row">
              <label>HP</label>
              <input
                type="number"
                value={currentHP}
                onChange={(e) => {
                  const newHP = parseInt(e.target.value) || 0;
                  setCurrentHP(newHP);
                  handleUpdateCurrentHP(newHP);
                }}
              />
              <span className="cs-hp-modal-max">/ {effectiveMaxHP}</span>
            </div>

            <div className="cs-hp-modal-row">
              <label>TEMP</label>
              <input
                type="number"
                value={tempHP}
                onChange={(e) => {
                  const newTemp = parseInt(e.target.value) || 0;
                  setTempHP(newTemp);
                  handleUpdateTempHP(newTemp);
                }}
              />
            </div>

            {currentHP === 0 && (
              <div className="cs-hp-modal-death-saves">
                <div className="cs-death-saves-checkboxes">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={`success-${i}`}
                      className={`cs-death-save-checkbox cs-success ${
                        i < (character.deathSaves?.successes || 0) ? 'checked' : ''
                      }`}
                      onClick={async () => {
                        const current = character.deathSaves || { successes: 0, failures: 0 };
                        const newCount = current.successes === i + 1 ? i : i + 1;
                        await updateCharacter(gameId, character.id, {
                          deathSaves: { ...current, successes: newCount },
                        });
                      }}
                    />
                  ))}
                  {[0, 1, 2].map((i) => (
                    <div
                      key={`failure-${i}`}
                      className={`cs-death-save-checkbox cs-failure ${
                        i < (character.deathSaves?.failures || 0) ? 'checked' : ''
                      }`}
                      onClick={async () => {
                        const current = character.deathSaves || { successes: 0, failures: 0 };
                        const newCount = current.failures === i + 1 ? i : i + 1;
                        await updateCharacter(gameId, character.id, {
                          deathSaves: { ...current, failures: newCount },
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="cs-hp-modal-actions">
              <button className="cs-hp-btn-heal" onClick={handleHeal}>Heal</button>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button className="cs-hp-btn-damage" onClick={handleDamage}>Damage</button>
            </div>
          </div>

          <div className="cs-hp-modal-settings">
            <button
              className="cs-hp-settings-toggle"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? '▼' : '▶'} HP Settings
            </button>
            {showSettings && (
              <div className="cs-hp-settings-content">
                <div className="cs-hp-modal-row">
                  <label>Max HP</label>
                  <input
                    type="number"
                    value={maxHP}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value) || 0;
                      setMaxHP(newMax);
                      handleUpdateMaxHP(newMax);
                    }}
                  />
                </div>
                <div className="cs-hp-modal-row">
                  <label>HP Bonus</label>
                  <input
                    type="number"
                    value={hpBonus}
                    onChange={(e) => {
                      const newBonus = parseInt(e.target.value) || 0;
                      setHpBonus(newBonus);
                      handleUpdateHPBonus(newBonus);
                    }}
                    placeholder="0"
                  />
                </div>
                <div className="cs-hp-modal-row">
                  <label>Hit Dice</label>
                  <select
                    value={hitDice}
                    onChange={(e) => {
                      setHitDice(e.target.value);
                      handleUpdateHitDice(e.target.value);
                    }}
                  >
                    <option value="d6">d6</option>
                    <option value="d8">d8</option>
                    <option value="d10">d10</option>
                    <option value="d12">d12</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
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
}

function CharacterHeader({ character, gameId, expanded, onToggleExpand }: CharacterHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [hpModalOpen, setHpModalOpen] = useState(false);

  const initiativeModifier = getAbilityModifier(character.abilities.dex);

  return (
      <>
        <div className="cs-header">
          {/* Desktop Layout */}
          <div className="cs-header-desktop">
            <div className="cs-header-left">
              <div className="cs-name-block">
                <h1 className="cs-name">{character.name}</h1>
                <button className="cs-settings-btn" onClick={() => setSettingsOpen(true)}>
                  ⚙️
                </button>
              </div>
              <p className="cs-subtitle">{character.race}</p>
              <p className="cs-subtitle">{character.class} {character.subclass && `(${character.subclass})`}</p>
              <button
                className="cs-level-btn"
                onClick={() => setLevelModalOpen(true)}
              >
                Level {character.level}
              </button>
            </div>

            <div className="cs-header-right">
              <div className="cs-combat-stats-desktop">
                <div className="cs-stat-item">
                  <div className="cs-stat-value cs-bordered">{character.ac}</div>
                  <div className="cs-stat-label">Armor</div>
                </div>
                <div className="cs-stat-item">
                  <div className="cs-stat-value">{character.speed}</div>
                  <div className="cs-stat-label">Speed</div>
                </div>
                <div className="cs-stat-item">
                  <div className="cs-stat-value">+{getProficiencyBonus(character.level)}</div>
                  <div className="cs-stat-label">Proficiency</div>
                </div>
              </div>
              <HPBoxDesktop character={character} gameId={gameId} onOpenModal={() => setHpModalOpen(true)} />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="cs-header-mobile">
            {/* Expandable content */}
            {expanded && (
              <div className="cs-mobile-expanded">
                <div className="cs-name-block">
                  <h1 className="cs-name">{character.name}</h1>
                  <button className="cs-settings-btn" onClick={() => setSettingsOpen(true)}>
                    ⚙️
                  </button>
                </div>
                <p className="cs-subtitle">
                  {character.race} — {character.class} {character.subclass && `(${character.subclass})`}
                </p>

                <button
                  className="cs-level-btn-mobile"
                  onClick={() => setLevelModalOpen(true)}
                >
                  Level {character.level}
                </button>

                {/* 4 stat blocks */}
                <div className="cs-expanded-stats">
                  <div
                    className="cs-mini-stat"
                    style={{ cursor: 'pointer' }}
                    onClick={async () => {
                      await updateCharacter(gameId, character.id, {
                        inspiration: !character.inspiration,
                      });
                    }}
                  >
                    <div className="cs-mini-label">Inspiration</div>
                    <div className="cs-mini-value">{character.inspiration ? '✓' : '—'}</div>
                  </div>
                  <div className="cs-mini-stat">
                    <div className="cs-mini-label">Initiative</div>
                    <div className="cs-mini-value">
                      {initiativeModifier >= 0 ? '+' : ''}{initiativeModifier}
                    </div>
                  </div>
                  <div className="cs-mini-stat">
                    <div className="cs-mini-label">Conditions</div>
                    <div className="cs-mini-value">0</div>
                  </div>
                  <div className="cs-mini-stat">
                    <div className="cs-mini-label">Exhaustion</div>
                    <select
                      className="cs-mini-value cs-exhaustion-select"
                      value={character.exhaustion || 0}
                      onChange={async (e) => {
                        await updateCharacter(gameId, character.id, {
                          exhaustion: Number(e.target.value),
                        });
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Always visible stats */}
            <div className="cs-quick-stats-mobile">
              <div className="cs-combat-stats-mobile">
                <div className="cs-stat-item">
                  <div className="cs-stat-value cs-bordered">{character.ac}</div>
                  <div className="cs-stat-label">Armor</div>
                </div>
                <div className="cs-stat-item">
                  <div className="cs-stat-value">{character.speed}</div>
                  <div className="cs-stat-label">Speed</div>
                </div>
              </div>

              <HPBoxMobile character={character} onClick={() => setHpModalOpen(true)} />
            </div>

            {/* Collapse toggle - mobile only */}
            <button className="cs-collapse-btn" onClick={onToggleExpand}>
              {expanded ? 'Collapse ▲' : 'Expand ▼'}
            </button>
          </div>
        </div>

        {/* Settings Modal */}
        {settingsOpen && (
          <SettingsModal
            character={character}
            gameId={gameId}
            onClose={() => setSettingsOpen(false)}
          />
        )}

        {/* Level/XP Modal */}
        {levelModalOpen && (
          <LevelXPModal
            character={character}
            gameId={gameId}
            onClose={() => setLevelModalOpen(false)}
          />
        )}

        {/* HP Modal */}
        {hpModalOpen && (
          <HPModal
            character={character}
            gameId={gameId}
            onClose={() => setHpModalOpen(false)}
          />
        )}
      </>
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