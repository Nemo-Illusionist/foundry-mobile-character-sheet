// D&D 2024 - Level & XP Modal Component
// For multiclass, redirects to Class tab for level distribution

import { useLevelXP } from '../../hooks';
import { XPForm } from '../shared';
import type { Character } from 'shared';
import './Modals.scss';

interface LevelXPModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function LevelXPModal({ character, gameId, onClose }: LevelXPModalProps) {
  const {
    currentXP,
    setCurrentXP,
    gainXPInput,
    setGainXPInput,
    message,
    classes,
    hasMultipleClasses,
    globalLevel,
    totalClassLevels,
    xpToNextLevel,
    handleLevelUp,
    handleXPChange,
    handleGainXP,
  } = useLevelXP(character, gameId, { showClassTabHint: true });

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

          {/* XP Form */}
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
            variant="modal"
          />
        </div>
      </div>
    </div>
  );
}
