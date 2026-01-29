// D&D 2024 - Class Tab Component
// Full multiclassing support

import { useState, useEffect, useRef } from 'react';
import { NumberInput } from '../../../../../shared';
import { updateCharacter } from '../../../../../../services/characters.service';
import {
  ABILITY_ORDER,
  ABILITY_NAMES,
  getSpellSlotsForCharacter,
  getWarlockPactMagic,
  CASTER_TYPE_NAMES,
  HIT_DICE_OPTIONS,
  getProficiencyBonus,
  STANDARD_CLASS_NAMES,
  CLASS_DEFAULTS,
} from '../../constants';
import { useLevelXP } from '../../hooks';
import { XPForm } from '../shared';
import { AddClassModal } from '../modals';
import type { SpellcasterType } from '../../constants';
import type { Character, CharacterClass, AbilityName } from 'shared';

interface ClassTabProps {
  character: Character;
  gameId: string;
}

export function ClassTab({ character, gameId }: ClassTabProps) {
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showXPSection, setShowXPSection] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState<Set<number>>(new Set());
  const [customClassIndices, setCustomClassIndices] = useState<Set<number>>(new Set());

  // Use shared hook for level/XP management
  const {
    currentXP,
    setCurrentXP,
    gainXPInput,
    setGainXPInput,
    message,
    clearMessage,
    classes,
    hasMultipleClasses,
    globalLevel,
    totalClassLevels,
    xpToNextLevel,
    handleLevelUp,
    handleXPChange,
    handleGainXP,
  } = useLevelXP(character, gameId);

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

    // Recalculate spell slots if caster type changed
    const spellUpdates: Partial<Character> = {};
    if ('spellcasterType' in changes) {
      const hasSpellcasting = updatedClasses.some(c =>
        c.spellcasterType && c.spellcasterType !== 'none'
      );
      spellUpdates.spellSlots = hasSpellcasting ? getSpellSlotsForCharacter(updatedClasses) : {};
      spellUpdates.hideSpellsTab = !hasSpellcasting;

      const warlockClass = updatedClasses.find(c => c.spellcasterType === 'warlock');
      if (warlockClass) {
        const pactMagic = getWarlockPactMagic(warlockClass.level);
        if (pactMagic) {
          spellUpdates.pactMagicSlots = {
            current: pactMagic.slots,
            max: pactMagic.slots,
            level: pactMagic.level,
          };
        }
      } else if (!updatedClasses.some(c => c.spellcasterType === 'warlock')) {
        spellUpdates.pactMagicSlots = null as unknown as undefined;
      }
    }

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      ...legacyUpdates,
      ...spellUpdates,
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

    // Clear allocation message when levels are adjusted
    clearMessage();
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

  // Toggle class card expansion
  const toggleClassExpanded = (index: number) => {
    setExpandedClasses(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="cs-class-tab">
      {/* Level Card - like class card */}
      <div className="cs-level-card">
        <button
          className="cs-level-card-header"
          onClick={() => setShowXPSection(!showXPSection)}
        >
          <div className="cs-level-card-title">
            <span className={`cs-level-toggle-icon ${showXPSection ? 'open' : ''}`}>▾</span>
            Level {globalLevel}
          </div>
          {globalLevel < 20 && (
            <button
              className="cs-level-up-btn"
              onClick={(e) => { e.stopPropagation(); handleLevelUp(); }}
            >
              Level Up
            </button>
          )}
        </button>

        {/* Show class level allocation for multiclass */}
        {hasMultipleClasses && totalClassLevels !== globalLevel && (
          <div className="cs-level-allocation">
            {totalClassLevels < globalLevel
              ? `${globalLevel - totalClassLevels} level(s) to allocate`
              : `Class levels exceed global level!`}
          </div>
        )}

        {/* Collapsible XP Section */}
        {showXPSection && (
          <div className="cs-level-card-body">
            <XPForm
              currentXP={currentXP}
              onCurrentXPChange={setCurrentXP}
              gainXPInput={gainXPInput}
              onGainXPChange={setGainXPInput}
              onUpdateXP={handleXPChange}
              onAddXP={handleGainXP}
              xpToNextLevel={xpToNextLevel}
              globalLevel={globalLevel}
              message={message}
              variant="card"
            />
          </div>
        )}
      </div>

      {/* Class Cards */}
      <div className="cs-class-list">
        {classes.map((cls, index) => {
          const spellcasterType = (cls.spellcasterType || 'none') as SpellcasterType;
          const isSpellcaster = spellcasterType !== 'none';
          const isManual = spellcasterType === 'manual';
          const hasClass = cls.name && cls.name.trim() !== '';

          const isExpanded = expandedClasses.has(index);

          return (
            <div key={index} className="cs-class-card">
              <button
                className="cs-class-card-header"
                onClick={() => toggleClassExpanded(index)}
              >
                <div className="cs-class-card-title">
                  <span className={`cs-class-toggle-icon ${isExpanded ? 'open' : ''}`}>▾</span>
                  {hasClass ? cls.name : 'No Class'}
                  {cls.subclass && <span className="cs-class-subclass"> ({cls.subclass})</span>}
                </div>
                <div className="cs-class-card-level">
                  {hasMultipleClasses && (
                    <button
                      className="cs-class-level-btn"
                      onClick={(e) => { e.stopPropagation(); handleLevelChange(index, -1); }}
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
                      onClick={(e) => { e.stopPropagation(); handleLevelChange(index, 1); }}
                      disabled={totalClassLevels >= globalLevel}
                    >
                      +
                    </button>
                  )}
                </div>
              </button>

              {isExpanded && (() => {
                const isCustom = customClassIndices.has(index) ||
                  (cls.name !== '' && !STANDARD_CLASS_NAMES.includes(cls.name));
                const selectValue = STANDARD_CLASS_NAMES.includes(cls.name)
                  ? cls.name
                  : isCustom ? 'Custom' : '';

                return (
              <div className="cs-class-card-body">
                {/* Class Selection */}
                <div className="cs-class-field">
                  <label>Class</label>
                  <select
                    value={selectValue}
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (selected === 'Custom') {
                        setCustomClassIndices(prev => new Set(prev).add(index));
                        updateClass(index, { name: '' });
                      } else if (selected === '') {
                        setCustomClassIndices(prev => {
                          const next = new Set(prev);
                          next.delete(index);
                          return next;
                        });
                        updateClass(index, { name: '' });
                      } else {
                        setCustomClassIndices(prev => {
                          const next = new Set(prev);
                          next.delete(index);
                          return next;
                        });
                        const defaults = CLASS_DEFAULTS[selected];
                        if (defaults) {
                          updateClass(index, {
                            name: selected,
                            hitDice: defaults.hitDice,
                            spellcasterType: defaults.spellcasterType,
                            ...(defaults.spellcastingAbility && { spellcastingAbility: defaults.spellcastingAbility }),
                          });
                        } else {
                          updateClass(index, { name: selected });
                        }
                      }
                    }}
                  >
                    <option value="">Select a class...</option>
                    {STANDARD_CLASS_NAMES.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                    <option value="Custom">Custom Class</option>
                  </select>
                </div>

                {/* Custom Class Name */}
                {isCustom && (
                  <div className="cs-class-field">
                    <label>Custom Class Name</label>
                    <input
                      type="text"
                      value={cls.name}
                      onChange={(e) => updateClass(index, { name: e.target.value })}
                      placeholder="Enter class name..."
                    />
                  </div>
                )}

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
                );
              })()}
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
