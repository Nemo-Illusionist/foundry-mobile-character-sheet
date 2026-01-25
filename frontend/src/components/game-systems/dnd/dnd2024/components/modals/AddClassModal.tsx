// D&D 2024 - Add Class Modal Component
// For multiclassing support

import { useState, useEffect } from 'react';
import { Button } from '../../../../../shared';
import {
  STANDARD_CLASS_NAMES,
  CLASS_DEFAULTS,
  HIT_DICE_OPTIONS,
  CASTER_TYPE_NAMES,
  ABILITY_ORDER,
  ABILITY_NAMES,
  checkMulticlassPrerequisites,
  checkAllClassPrerequisites,
} from '../../constants';
import { getClasses } from '../../utils';
import type { Character, CharacterClass, SpellcasterType, AbilityName } from 'shared';
import './Modals.scss';

interface AddClassModalProps {
  character: Character;
  onAdd: (newClass: CharacterClass) => void;
  onClose: () => void;
}

export function AddClassModal({ character, onAdd, onClose }: AddClassModalProps) {
  const [className, setClassName] = useState('');
  const [customName, setCustomName] = useState('');
  const [hitDice, setHitDice] = useState<string>('d8');
  const [spellcasterType, setSpellcasterType] = useState<SpellcasterType>('none');
  const [spellcastingAbility, setSpellcastingAbility] = useState<AbilityName>('int');
  const [prerequisiteWarning, setPrerequisiteWarning] = useState<string>('');
  const [existingClassWarning, setExistingClassWarning] = useState<string>('');

  const existingClasses = getClasses(character);
  const isFirstClass = existingClasses.length === 0 ||
    (existingClasses.length === 1 && !existingClasses[0].name);

  // Check prerequisites when class changes
  useEffect(() => {
    const selectedClass = className === 'Custom' ? customName : className;
    if (!selectedClass) {
      setPrerequisiteWarning('');
      return;
    }

    // Check if can multiclass into this class
    const result = checkMulticlassPrerequisites(character.abilities, selectedClass);
    if (!result.canMulticlass && result.message) {
      setPrerequisiteWarning(result.message);
    } else {
      setPrerequisiteWarning('');
    }
  }, [className, customName, character.abilities]);

  // Check if existing classes meet prerequisites
  useEffect(() => {
    if (isFirstClass) {
      setExistingClassWarning('');
      return;
    }

    const classNames = existingClasses.map(c => c.name).filter(Boolean);
    const result = checkAllClassPrerequisites(character.abilities, classNames);
    if (!result.canMulticlass && result.issues.length > 0) {
      const messages = result.issues.map(i => i.message).join('; ');
      setExistingClassWarning(`Warning: ${messages}`);
    } else {
      setExistingClassWarning('');
    }
  }, [existingClasses, character.abilities, isFirstClass]);

  // Auto-fill defaults when selecting a standard class
  useEffect(() => {
    if (className && className !== 'Custom') {
      const defaults = CLASS_DEFAULTS[className];
      if (defaults) {
        setHitDice(defaults.hitDice);
        setSpellcasterType(defaults.spellcasterType);
        if (defaults.spellcastingAbility) {
          setSpellcastingAbility(defaults.spellcastingAbility);
        }
      }
    }
  }, [className]);

  const handleSubmit = () => {
    const finalName = className === 'Custom' ? customName : className;
    if (!finalName.trim()) return;

    // First class starts at level 1, additional classes start at level 0
    // (user must allocate levels from global level)
    const newClass: CharacterClass = {
      name: finalName.trim(),
      level: isFirstClass ? 1 : 0,
      hitDice,
      hitDiceUsed: 0,
      spellcasterType,
      ...(spellcasterType !== 'none' && { spellcastingAbility }),
    };

    onAdd(newClass);
    onClose();
  };

  const isSpellcaster = spellcasterType !== 'none';
  const hasPrerequisiteIssue = Boolean(prerequisiteWarning) || Boolean(existingClassWarning);

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>{isFirstClass ? 'Set Class' : 'Add Class'}</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {/* Class Selection */}
          <div className="cs-form-group">
            <label>Class</label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            >
              <option value="">Select a class...</option>
              {STANDARD_CLASS_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
              <option value="Custom">Custom Class</option>
            </select>
          </div>

          {/* Custom Class Name */}
          {className === 'Custom' && (
            <div className="cs-form-group">
              <label>Custom Class Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter class name..."
              />
            </div>
          )}

          {/* Prerequisite Warning */}
          {prerequisiteWarning && !isFirstClass && (
            <div className="cs-warning-box">
              ⚠️ {prerequisiteWarning}
            </div>
          )}

          {/* Existing Class Warning */}
          {existingClassWarning && (
            <div className="cs-warning-box">
              ⚠️ {existingClassWarning}
            </div>
          )}

          {/* Hit Dice */}
          <div className="cs-form-group">
            <label>Hit Dice</label>
            <select
              value={hitDice}
              onChange={(e) => setHitDice(e.target.value)}
            >
              {HIT_DICE_OPTIONS.map((dice) => (
                <option key={dice} value={dice}>{dice}</option>
              ))}
            </select>
          </div>

          {/* Caster Type */}
          <div className="cs-form-group">
            <label>Spellcasting</label>
            <select
              value={spellcasterType}
              onChange={(e) => setSpellcasterType(e.target.value as SpellcasterType)}
            >
              {(Object.keys(CASTER_TYPE_NAMES) as SpellcasterType[]).map((type) => (
                <option key={type} value={type}>{CASTER_TYPE_NAMES[type]}</option>
              ))}
            </select>
          </div>

          {/* Spellcasting Ability */}
          {isSpellcaster && (
            <div className="cs-form-group">
              <label>Spellcasting Ability</label>
              <select
                value={spellcastingAbility}
                onChange={(e) => setSpellcastingAbility(e.target.value as AbilityName)}
              >
                {ABILITY_ORDER.map((ab) => (
                  <option key={ab} value={ab}>{ABILITY_NAMES[ab]}</option>
                ))}
              </select>
            </div>
          )}

          {/* Info */}
          {!isFirstClass && (
            <p className="cs-modal-info">
              New class will start at level 1. Use the Class tab to manage levels.
            </p>
          )}
        </div>

        <div className="cs-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!(className === 'Custom' ? customName.trim() : className)}
          >
            {hasPrerequisiteIssue && !isFirstClass ? 'Add Anyway' : 'Add Class'}
          </Button>
        </div>
      </div>
    </div>
  );
}
