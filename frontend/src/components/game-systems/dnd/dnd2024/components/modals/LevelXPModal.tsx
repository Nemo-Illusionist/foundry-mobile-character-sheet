// D&D 2024 - Level & XP Modal Component
// For multiclass, redirects to Class tab for level distribution

import { useState, useEffect } from 'react';
import { Button, NumberInput } from '../../../../../shared';
import { updateCharacter } from '../../../../../../services/characters.service';
import {
  XP_THRESHOLDS,
  calculateLevelFromXP,
  getProficiencyBonus,
  getSpellSlotsForCharacter,
  getWarlockPactMagic,
} from '../../constants';
import { getClasses, isMulticlass } from '../../utils';
import type { Character, CharacterClass } from 'shared';
import './Modals.scss';

interface LevelXPModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function LevelXPModal({ character, gameId, onClose }: LevelXPModalProps) {
  const [currentXP, setCurrentXP] = useState(character.experience || 0);
  const [gainXPInput, setGainXPInput] = useState(0);
  const [message, setMessage] = useState('');

  const classes = getClasses(character);
  const hasMultipleClasses = isMulticlass(character);

  // Sync currentXP with character.experience when it changes
  useEffect(() => {
    setCurrentXP(character.experience || 0);
  }, [character.experience]);

  // Global level = from XP, Class levels = sum of individual class levels
  const globalLevel = calculateLevelFromXP(currentXP);
  const totalClassLevels = classes.reduce((sum, c) => sum + c.level, 0);
  const nextLevelXP = globalLevel < 20 ? XP_THRESHOLDS[globalLevel] : null;

  // Calculate spell slots update for multiclass
  const getSpellSlotsUpdate = (updatedClasses: CharacterClass[]) => {
    const hasAutoSlots = updatedClasses.some(c =>
      c.spellcasterType === 'full' ||
      c.spellcasterType === 'half' ||
      c.spellcasterType === 'third' ||
      c.spellcasterType === 'warlock'
    );

    if (hasAutoSlots) {
      return getSpellSlotsForCharacter(updatedClasses);
    }
    return undefined;
  };

  // Get Pact Magic update if warlock leveled up
  const getPactMagicUpdate = (updatedClasses: CharacterClass[]) => {
    const warlockClass = updatedClasses.find(c => c.spellcasterType === 'warlock');
    if (warlockClass) {
      const pactMagic = getWarlockPactMagic(warlockClass.level);
      if (pactMagic) {
        return {
          pactMagicSlots: {
            current: pactMagic.slots,
            max: pactMagic.slots,
            level: pactMagic.level,
          },
        };
      }
    }
    return {};
  };

  // Level up: increases global level (XP), auto-increases class only if single class
  const handleLevelUp = async () => {
    if (globalLevel >= 20) {
      setMessage('Maximum level reached!');
      return;
    }

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
      setMessage(`Level ${newGlobalLevel}! ${unallocated} level(s) to allocate in Class tab.`);
      return;
    }

    // Single class - also increase class level
    const updatedClasses = [...classes];
    updatedClasses[0] = { ...updatedClasses[0], level: newGlobalLevel };
    const spellSlotsUpdate = getSpellSlotsUpdate(updatedClasses);
    const pactMagicUpdate = getPactMagicUpdate(updatedClasses);

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      experience: newXP,
      level: newGlobalLevel,
      proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      ...(spellSlotsUpdate && { spellSlots: spellSlotsUpdate }),
      ...pactMagicUpdate,
    });
    setCurrentXP(newXP);
    setMessage(`Level ${newGlobalLevel}!`);
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
        setMessage(`Level ${newGlobalLevel}! ${diff} level(s) to allocate in Class tab.`);
      } else if (diff < 0) {
        setMessage(`Level ${newGlobalLevel}! Class levels exceed by ${-diff}. Reduce in Class tab.`);
      } else {
        setMessage('XP updated.');
      }
      return;
    }

    // Single class - auto-level class to match global
    const updatedClasses = [...classes];
    updatedClasses[0] = { ...updatedClasses[0], level: newGlobalLevel };
    const spellSlotsUpdate = getSpellSlotsUpdate(updatedClasses);
    const pactMagicUpdate = getPactMagicUpdate(updatedClasses);

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      experience: currentXP,
      level: newGlobalLevel,
      proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      ...(spellSlotsUpdate && { spellSlots: spellSlotsUpdate }),
      ...pactMagicUpdate,
    });
    setMessage(newGlobalLevel !== globalLevel ? `Level ${newGlobalLevel}!` : 'XP updated.');
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
        setMessage(`+${xpGained} XP! Level ${newGlobalLevel}! ${diff} level(s) to allocate.`);
      } else {
        setMessage(`+${xpGained} XP!`);
      }
      return;
    }

    // Single class - auto-level class to match global
    const updatedClasses = [...classes];
    updatedClasses[0] = { ...updatedClasses[0], level: newGlobalLevel };
    const spellSlotsUpdate = getSpellSlotsUpdate(updatedClasses);
    const pactMagicUpdate = getPactMagicUpdate(updatedClasses);

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      experience: newXP,
      level: newGlobalLevel,
      proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      ...(spellSlotsUpdate && { spellSlots: spellSlotsUpdate }),
      ...pactMagicUpdate,
    });
    setMessage(newGlobalLevel !== globalLevel ? `+${xpGained} XP! Level ${newGlobalLevel}!` : `+${xpGained} XP!`);
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>Level & Experience</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {/* Current Level */}
          <div className="cs-level-section">
            <div className="cs-level-display">
              <span className="cs-level-current">Level {globalLevel}</span>
              {globalLevel < 20 && (
                <button className="cs-level-up-btn" onClick={handleLevelUp}>Level Up</button>
              )}
            </div>
            {hasMultipleClasses && (
              <div className="cs-multiclass-summary">
                {classes.map((cls, i) => (
                  <span key={i} className="cs-class-level-badge">
                    {cls.name || 'Class'} {cls.level}
                  </span>
                ))}
              </div>
            )}
            {hasMultipleClasses && totalClassLevels !== globalLevel && (
              <p className="cs-modal-info cs-level-allocation-warning">
                {totalClassLevels < globalLevel
                  ? `${globalLevel - totalClassLevels} level(s) to allocate in Class tab`
                  : 'Class levels exceed global level!'}
              </p>
            )}
            {hasMultipleClasses && totalClassLevels === globalLevel && (
              <p className="cs-modal-info">
                Use Class tab to adjust individual class levels
              </p>
            )}
          </div>

          {/* Current XP */}
          <div className="cs-form-group">
            <label>Current Experience</label>
            <div className="cs-xp-input-row">
              <NumberInput
                value={currentXP}
                onChange={setCurrentXP}
                min={0}
                defaultValue={0}
              />
              <Button variant="secondary" onClick={handleXPChange}>Update</Button>
            </div>
            {nextLevelXP && (
              <small className="cs-xp-info">
                {nextLevelXP - currentXP} XP until level {globalLevel + 1}
              </small>
            )}
          </div>

          {/* Gain XP */}
          <div className="cs-form-group">
            <label>Gain Experience</label>
            <div className="cs-xp-input-row">
              <NumberInput
                value={gainXPInput}
                onChange={setGainXPInput}
                min={0}
                defaultValue={0}
                placeholder="Enter XP gained"
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
