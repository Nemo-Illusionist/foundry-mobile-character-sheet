// D&D 2024 - Level & XP Modal Component

import { useState, useEffect } from 'react';
import { Button } from '../../../../../shared/Button';
import { updateCharacter } from '../../../../../../services/characters.service';
import { XP_THRESHOLDS, calculateLevelFromXP } from '../../constants/experience';
import { getProficiencyBonus } from '../../constants/proficiencyBonus';
import type { Character } from 'shared';
import './Modals.css';

interface LevelXPModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function LevelXPModal({ character, gameId, onClose }: LevelXPModalProps) {
  const [currentXP, setCurrentXP] = useState(character.experience || 0);
  const [gainXPInput, setGainXPInput] = useState('');
  const [message, setMessage] = useState('');

  // Sync currentXP with character.experience when it changes
  useEffect(() => {
    setCurrentXP(character.experience || 0);
  }, [character.experience]);

  const currentLevel = calculateLevelFromXP(currentXP);
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
      proficiencyBonus: getProficiencyBonus(newLevel),
    });

    setCurrentXP(newXP);
    setMessage(`Level increased to ${newLevel}!`);
  };

  const handleXPChange = async () => {
    await updateCharacter(gameId, character.id, {
      experience: currentXP,
      level: currentLevel,
      proficiencyBonus: getProficiencyBonus(currentLevel),
    });
    setMessage('Experience updated!');
  };

  const handleGainXP = async () => {
    const gainedXP = parseInt(gainXPInput) || 0;
    if (gainedXP <= 0) return;

    const newXP = currentXP + gainedXP;
    const oldLevel = currentLevel;
    const newLevel = calculateLevelFromXP(newXP);

    setCurrentXP(newXP);
    setGainXPInput('');

    await updateCharacter(gameId, character.id, {
      experience: newXP,
      level: newLevel,
      proficiencyBonus: getProficiencyBonus(newLevel),
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
