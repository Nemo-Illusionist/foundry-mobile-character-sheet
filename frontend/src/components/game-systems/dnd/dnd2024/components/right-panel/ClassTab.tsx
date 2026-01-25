// D&D 2024 - Class Tab Component
// Full multiclassing support

import { useState, useEffect, useRef } from 'react';
import { NumberInput, Button } from '../../../../../shared';
// NumberInput used for manual spell slots below
import { updateCharacter } from '../../../../../../services/characters.service';
import {
  ABILITY_ORDER,
  ABILITY_NAMES,
  getSpellSlotsForCharacter,
  getWarlockPactMagic,
  CASTER_TYPE_NAMES,
  HIT_DICE_OPTIONS,
  getProficiencyBonus,
  XP_THRESHOLDS,
  calculateLevelFromXP,
} from '../../constants';
import { getClasses, isMulticlass } from '../../utils';
import { AddClassModal } from '../modals';
import type { SpellcasterType } from '../../constants';
import type { Character, CharacterClass, AbilityName } from 'shared';

interface ClassTabProps {
  character: Character;
  gameId: string;
}

export function ClassTab({ character, gameId }: ClassTabProps) {
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [currentXP, setCurrentXP] = useState(character.experience || 0);
  const [gainXPInput, setGainXPInput] = useState(0);
  const [xpMessage, setXpMessage] = useState('');

  const classes = getClasses(character);
  const hasMultipleClasses = isMulticlass(character);

  // Sync XP with character
  useEffect(() => {
    setCurrentXP(character.experience || 0);
  }, [character.experience]);

  // Global level = from XP, Class levels = sum of individual class levels
  const globalLevel = calculateLevelFromXP(currentXP);
  const totalClassLevels = classes.reduce((sum, c) => sum + c.level, 0);
  const nextLevelXP = globalLevel < 20 ? XP_THRESHOLDS[globalLevel] : null;
  const prevGlobalLevelRef = useRef(globalLevel);

  // Update proficiency bonus and spell slots when global level changes
  useEffect(() => {
    const levelChanged = prevGlobalLevelRef.current !== globalLevel;

    if (levelChanged) {
      // Recalculate spell slots based on all classes
      const hasAutoSlots = classes.some(c =>
        c.spellcasterType === 'full' ||
        c.spellcasterType === 'half' ||
        c.spellcasterType === 'third' ||
        c.spellcasterType === 'warlock'
      );

      if (hasAutoSlots) {
        const newSlots = getSpellSlotsForCharacter(classes);
        const warlockClass = classes.find(c => c.spellcasterType === 'warlock');
        const pactMagic = warlockClass ? getWarlockPactMagic(warlockClass.level) : null;

        updateCharacter(gameId, character.id, {
          spellSlots: newSlots,
          level: globalLevel,
          proficiencyBonus: getProficiencyBonus(globalLevel),
          ...(pactMagic && {
            pactMagicSlots: {
              current: pactMagic.slots,
              max: pactMagic.slots,
              level: pactMagic.level,
            },
          }),
        });
      } else {
        updateCharacter(gameId, character.id, {
          level: globalLevel,
          proficiencyBonus: getProficiencyBonus(globalLevel),
        });
      }
    }

    prevGlobalLevelRef.current = globalLevel;
  }, [globalLevel, classes, gameId, character.id]);

  // Update a specific class (doesn't affect global level - that's tied to XP)
  const updateClass = async (index: number, changes: Partial<CharacterClass>) => {
    const updatedClasses = [...classes];
    updatedClasses[index] = { ...updatedClasses[index], ...changes };

    // Build legacy field updates for primary class
    const legacyUpdates: Partial<Character> = {};
    if (index === 0) {
      if ('name' in changes) legacyUpdates.class = changes.name;
      if ('subclass' in changes) legacyUpdates.subclass = changes.subclass;
      if ('hitDice' in changes) legacyUpdates.hitDice = changes.hitDice;
      if ('spellcasterType' in changes) legacyUpdates.spellcasterType = changes.spellcasterType;
      if ('spellcastingAbility' in changes) legacyUpdates.spellcastingAbility = changes.spellcastingAbility;
    }

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      ...legacyUpdates,
    });
  };

  // Delete a class (doesn't affect global level - that's tied to XP)
  const deleteClass = async (index: number) => {
    if (classes.length <= 1) return; // Can't delete last class

    const updatedClasses = classes.filter((_, i) => i !== index);

    // Update legacy fields if primary class changes (filter out undefined)
    const newPrimary = updatedClasses[0];
    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      class: newPrimary?.name || '',
      ...(newPrimary?.subclass && { subclass: newPrimary.subclass }),
      ...(newPrimary?.hitDice && { hitDice: newPrimary.hitDice }),
      ...(newPrimary?.spellcasterType && { spellcasterType: newPrimary.spellcasterType }),
      ...(newPrimary?.spellcastingAbility && { spellcastingAbility: newPrimary.spellcastingAbility }),
    });
  };

  // Add a new class (doesn't affect global level - that's tied to XP)
  const addClass = async (newClass: CharacterClass) => {
    // If first class has no name, replace it instead of adding
    const isFirstClassEmpty = classes.length === 1 && (!classes[0].name || !classes[0].name.trim());
    const updatedClasses = isFirstClassEmpty
      ? [newClass]
      : [...classes, newClass];

    // Check if this adds spellcasting
    const hasSpellcasting = newClass.spellcasterType && newClass.spellcasterType !== 'none';

    // Update legacy fields for primary class (filter out undefined)
    const primary = updatedClasses[0];
    const legacyUpdates: Partial<Character> = {
      class: primary.name || '',
      ...(primary.subclass && { subclass: primary.subclass }),
      ...(primary.hitDice && { hitDice: primary.hitDice }),
      ...(primary.spellcasterType && { spellcasterType: primary.spellcasterType }),
      ...(primary.spellcastingAbility && { spellcastingAbility: primary.spellcastingAbility }),
    };

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      hideSpellsTab: !hasSpellcasting && character.hideSpellsTab,
      ...legacyUpdates,
    });
  };

  // Handle level change for a class
  // + only active if totalClassLevels < globalLevel
  // - always active, min level = 0
  const handleLevelChange = async (index: number, delta: number) => {
    const cls = classes[index];

    // For increment: check if totalClassLevels < globalLevel
    if (delta > 0 && totalClassLevels >= globalLevel) return;

    // Allow level 0, cap at 20
    const newLevel = Math.max(0, Math.min(20, cls.level + delta));

    await updateClass(index, { level: newLevel });

    // Clear message if levels are now properly allocated
    const newTotalClassLevels = totalClassLevels + delta;
    if (newTotalClassLevels === globalLevel) {
      setXpMessage('');
    } else if (newTotalClassLevels < globalLevel) {
      setXpMessage(`${globalLevel - newTotalClassLevels} level(s) to allocate.`);
    } else {
      setXpMessage(`Reduce class levels by ${newTotalClassLevels - globalLevel}.`);
    }
  };

  // Handle caster type change
  const handleCasterTypeChange = async (index: number, type: SpellcasterType) => {
    const updatedClasses = [...classes];
    updatedClasses[index] = { ...updatedClasses[index], spellcasterType: type };

    // Recalculate spell slots
    const newSlots = getSpellSlotsForCharacter(updatedClasses);
    const warlockClass = updatedClasses.find(c => c.spellcasterType === 'warlock');
    const pactMagic = warlockClass ? getWarlockPactMagic(warlockClass.level) : null;

    const hasSpellcasting = updatedClasses.some(c =>
      c.spellcasterType && c.spellcasterType !== 'none'
    );

    // Build legacy field updates for primary class
    const legacyUpdates: Partial<Character> = {};
    if (index === 0) {
      legacyUpdates.spellcasterType = type;
    }

    // Build update object
    const updates: Partial<Character> = {
      classes: updatedClasses,
      spellSlots: hasSpellcasting ? newSlots : {},
      hideSpellsTab: !hasSpellcasting,
      ...legacyUpdates,
    };

    // Handle Pact Magic
    if (pactMagic) {
      updates.pactMagicSlots = {
        current: pactMagic.slots,
        max: pactMagic.slots,
        level: pactMagic.level,
      };
    } else if (!warlockClass) {
      // Remove pact magic if no warlock - use null for Firestore
      updates.pactMagicSlots = null as unknown as undefined;
    }

    await updateCharacter(gameId, character.id, updates);
  };

  // Handle manual slot change
  const handleSlotMaxChange = async (level: number, max: number) => {
    const spellSlots = character.spellSlots || {};
    const slot = spellSlots[level] || { current: 0, max: 0 };
    await updateCharacter(gameId, character.id, {
      spellSlots: {
        ...spellSlots,
        [level]: { current: Math.min(slot.current, max), max },
      },
    });
  };

  // Handle XP change (single class auto-levels class to match global)
  const handleXPChange = async () => {
    const newGlobalLevel = calculateLevelFromXP(currentXP);

    // For multiclass, don't auto-change class levels - user does it manually
    if (hasMultipleClasses) {
      await updateCharacter(gameId, character.id, {
        experience: currentXP,
        level: newGlobalLevel,
        proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      });

      const diff = newGlobalLevel - totalClassLevels;
      if (diff > 0) {
        setXpMessage(`Level ${newGlobalLevel}! ${diff} level(s) to allocate.`);
      } else if (diff < 0) {
        setXpMessage(`Level ${newGlobalLevel}! Reduce class levels by ${-diff}.`);
      } else {
        setXpMessage('XP updated.');
      }
      return;
    }

    // Single class - auto-level class to match global
    const updatedClasses = [...classes];
    updatedClasses[0] = { ...updatedClasses[0], level: newGlobalLevel };
    const spellSlotsUpdate = getSpellSlotsForCharacter(updatedClasses);
    const warlockClass = updatedClasses.find(c => c.spellcasterType === 'warlock');
    const pactMagic = warlockClass ? getWarlockPactMagic(warlockClass.level) : null;

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      experience: currentXP,
      level: newGlobalLevel,
      proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      spellSlots: spellSlotsUpdate,
      ...(pactMagic && {
        pactMagicSlots: {
          current: pactMagic.slots,
          max: pactMagic.slots,
          level: pactMagic.level,
        },
      }),
    });
    setXpMessage(newGlobalLevel !== globalLevel ? `Level ${newGlobalLevel}!` : 'XP updated.');
  };

  // Handle gaining XP (single class auto-levels class to match global)
  const handleGainXP = async () => {
    if (gainXPInput <= 0) return;

    const newXP = currentXP + gainXPInput;
    const newGlobalLevel = calculateLevelFromXP(newXP);
    const xpGained = gainXPInput;

    setCurrentXP(newXP);
    setGainXPInput(0);

    // For multiclass, don't auto-level class
    if (hasMultipleClasses) {
      await updateCharacter(gameId, character.id, {
        experience: newXP,
        level: newGlobalLevel,
        proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      });

      const diff = newGlobalLevel - totalClassLevels;
      if (diff > 0) {
        setXpMessage(`+${xpGained} XP! Level ${newGlobalLevel}! ${diff} level(s) to allocate.`);
      } else {
        setXpMessage(`+${xpGained} XP!`);
      }
      return;
    }

    // Single class - auto-level class to match global
    const updatedClasses = [...classes];
    updatedClasses[0] = { ...updatedClasses[0], level: newGlobalLevel };
    const spellSlotsUpdate = getSpellSlotsForCharacter(updatedClasses);
    const warlockClass = updatedClasses.find(c => c.spellcasterType === 'warlock');
    const pactMagic = warlockClass ? getWarlockPactMagic(warlockClass.level) : null;

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      experience: newXP,
      level: newGlobalLevel,
      proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      spellSlots: spellSlotsUpdate,
      ...(pactMagic && {
        pactMagicSlots: {
          current: pactMagic.slots,
          max: pactMagic.slots,
          level: pactMagic.level,
        },
      }),
    });
    setXpMessage(newGlobalLevel !== globalLevel ? `+${xpGained} XP! Level ${newGlobalLevel}!` : `+${xpGained} XP!`);
  };

  // Level up: increases global level (XP), auto-increases class only if single class
  const handleLevelUp = async () => {
    if (globalLevel >= 20) return;

    const newGlobalLevel = globalLevel + 1;
    const newXP = XP_THRESHOLDS[globalLevel]; // XP needed for next level

    // For multiclass, only increase global level (user allocates class levels manually)
    if (hasMultipleClasses) {
      await updateCharacter(gameId, character.id, {
        experience: newXP,
        level: newGlobalLevel,
        proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      });
      setCurrentXP(newXP);
      const unallocated = newGlobalLevel - totalClassLevels;
      setXpMessage(`Level ${newGlobalLevel}! ${unallocated} level(s) to allocate.`);
      return;
    }

    // Single class - also increase class level
    const updatedClasses = [...classes];
    updatedClasses[0] = { ...updatedClasses[0], level: newGlobalLevel };
    const spellSlotsUpdate = getSpellSlotsForCharacter(updatedClasses);
    const warlockClass = updatedClasses.find(c => c.spellcasterType === 'warlock');
    const pactMagic = warlockClass ? getWarlockPactMagic(warlockClass.level) : null;

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      experience: newXP,
      level: newGlobalLevel,
      proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      spellSlots: spellSlotsUpdate,
      ...(pactMagic && {
        pactMagicSlots: {
          current: pactMagic.slots,
          max: pactMagic.slots,
          level: pactMagic.level,
        },
      }),
    });
    setCurrentXP(newXP);
    setXpMessage(`Level ${newGlobalLevel}!`);
  };

  return (
    <div className="cs-class-tab">
      {/* Level & XP Section - unified block */}
      <div className="cs-level-xp-block">
        {/* Level Row */}
        <div className="cs-xp-row">
          <div className="cs-level-display">Level {globalLevel}</div>
          {globalLevel < 20 && (
            <Button onClick={handleLevelUp}>Level Up</Button>
          )}
        </div>

        {/* Show class level allocation for multiclass */}
        {hasMultipleClasses && totalClassLevels !== globalLevel && (
          <div className="cs-level-allocation">
            {totalClassLevels < globalLevel
              ? `${globalLevel - totalClassLevels} level(s) to allocate`
              : `Class levels exceed global level!`}
          </div>
        )}

        {/* Current XP */}
        <label>Current Experience</label>
        <div className="cs-xp-row">
          <input
            type="number"
            value={currentXP}
            onChange={(e) => setCurrentXP(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
          />
          <Button variant="secondary" onClick={handleXPChange}>Update</Button>
        </div>
        {nextLevelXP && (
          <div className="cs-xp-help">
            {nextLevelXP - currentXP} XP until level {globalLevel + 1}
          </div>
        )}

        {/* Add XP */}
        <label>Gain Experience</label>
        <div className="cs-xp-row">
          <input
            type="number"
            value={gainXPInput || ''}
            onChange={(e) => setGainXPInput(Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="0"
            min={0}
          />
          <Button onClick={handleGainXP} disabled={gainXPInput <= 0}>Add</Button>
        </div>

        {xpMessage && <div className="cs-xp-message">{xpMessage}</div>}
      </div>

      {/* Class Cards */}
      <div className="cs-class-list">
        {classes.map((cls, index) => {
          const spellcasterType = (cls.spellcasterType || 'none') as SpellcasterType;
          const isSpellcaster = spellcasterType !== 'none';
          const isManual = spellcasterType === 'manual';
          const hasClass = cls.name && cls.name.trim() !== '';

          return (
            <div key={index} className="cs-class-card">
              <div className="cs-class-card-header">
                <div className="cs-class-card-title">
                  {hasClass ? cls.name : 'No Class'}
                  {cls.subclass && <span className="cs-class-subclass"> ({cls.subclass})</span>}
                </div>
                <div className="cs-class-card-level">
                  {hasMultipleClasses && (
                    <button
                      className="cs-class-level-btn"
                      onClick={() => handleLevelChange(index, -1)}
                      disabled={cls.level <= 0}
                    >
                      −
                    </button>
                  )}
                  <span className="cs-class-level-label">Lvl</span>
                  <span className="cs-class-level-value">{cls.level}</span>
                  {hasMultipleClasses && (
                    <button
                      className="cs-class-level-btn"
                      onClick={() => handleLevelChange(index, 1)}
                      disabled={totalClassLevels >= globalLevel}
                    >
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className="cs-class-card-body">
                {/* Class Name */}
                <div className="cs-class-field">
                  <label>Class</label>
                  <input
                    type="text"
                    value={cls.name}
                    onChange={(e) => updateClass(index, { name: e.target.value })}
                    placeholder="Fighter, Wizard, Rogue..."
                  />
                </div>

                {/* Subclass */}
                <div className="cs-class-field">
                  <label>Subclass</label>
                  <input
                    type="text"
                    value={cls.subclass || ''}
                    onChange={(e) => updateClass(index, { subclass: e.target.value })}
                    placeholder="Champion, Evocation..."
                  />
                </div>

                {/* Hit Dice */}
                <div className="cs-class-field">
                  <label>Hit Dice</label>
                  <select
                    value={cls.hitDice || 'd8'}
                    onChange={(e) => updateClass(index, { hitDice: e.target.value })}
                  >
                    {HIT_DICE_OPTIONS.map((dice) => (
                      <option key={dice} value={dice}>{dice}</option>
                    ))}
                  </select>
                </div>

                {/* Caster Type */}
                <div className="cs-class-field">
                  <label>Caster Type</label>
                  <select
                    value={spellcasterType}
                    onChange={(e) => handleCasterTypeChange(index, e.target.value as SpellcasterType)}
                  >
                    {(Object.keys(CASTER_TYPE_NAMES) as SpellcasterType[]).map((type) => (
                      <option key={type} value={type}>{CASTER_TYPE_NAMES[type]}</option>
                    ))}
                  </select>
                </div>

                {/* Spellcasting Ability */}
                {isSpellcaster && (
                  <div className="cs-class-field">
                    <label>Spellcasting Ability</label>
                    <select
                      value={cls.spellcastingAbility || 'int'}
                      onChange={(e) => updateClass(index, { spellcastingAbility: e.target.value as AbilityName })}
                    >
                      {ABILITY_ORDER.map((ab) => (
                        <option key={ab} value={ab}>{ABILITY_NAMES[ab]}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Manual Spell Slots - only for first Manual class */}
                {isManual && index === classes.findIndex(c => c.spellcasterType === 'manual') && (
                  <div className="cs-class-field">
                    <label>Spell Slots (Max)</label>
                    <div className="cs-manual-slots-grid">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                        const spellSlots = character.spellSlots || {};
                        const slot = spellSlots[level] || { current: 0, max: 0 };
                        return (
                          <div key={level} className="cs-manual-slot">
                            <span className="cs-manual-slot-level">{level}</span>
                            <NumberInput
                              className="cs-manual-slot-input"
                              value={slot.max}
                              onChange={(val) => handleSlotMaxChange(level, val)}
                              min={0}
                              max={9}
                              defaultValue={0}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Delete button for multiclass */}
                {hasMultipleClasses && (
                  <button
                    className="cs-class-delete-btn"
                    onClick={() => deleteClass(index)}
                  >
                    Remove Class
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Class Button */}
        <button
          className="cs-class-add-btn"
          onClick={() => setShowAddClassModal(true)}
          disabled={globalLevel >= 20}
        >
          + Add Class
        </button>
      </div>

      {/* Multiclass info */}
      {hasMultipleClasses && (
        <p className="cs-class-info">
          Proficiency Bonus: +{getProficiencyBonus(globalLevel)} (based on global level)
        </p>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <AddClassModal
          character={character}
          onAdd={addClass}
          onClose={() => setShowAddClassModal(false)}
        />
      )}
    </div>
  );
}
