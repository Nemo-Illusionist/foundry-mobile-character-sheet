// D&D 2024 - HP Modal Component (Refactored)
// Supports multiclass hit dice

import { useHPModal } from '../../hooks';
import { HPDisplay } from './HPDisplay';
import { HealDamageActions } from './HealDamageActions';
import { DeathSavesSection } from './DeathSavesSection';
import { HPSettingsSection } from './HPSettingsSection';
import { HitDiceSection } from './HitDiceSection';
import type { Character } from 'shared';
import './HP.scss';

interface HPModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function HPModal({ character, gameId, onClose }: HPModalProps) {
  const {
    currentHP,
    tempHP,
    effectiveMaxHP,
    maxHP,
    hpBonus,
    amount,
    setAmount,
    showShortRestDialog,
    shortRestDiceType,
    shortRestDiceCount,
    setShortRestDiceType,
    setShortRestDiceCount,
    selectedTypeRemaining,
    hitDiceGroups,
    hasMultipleClasses,
    handleCurrentHPChange,
    handleTempHPChange,
    handleHeal,
    handleDamage,
    handleMaxHPChange,
    handleHPBonusChange,
    handleDeathSaveSuccessChange,
    handleDeathSaveFailureChange,
    handleHitDiceUsedChange,
    toggleShortRestDialog,
    handleShortRest,
    handleLongRest,
  } = useHPModal(character, gameId);

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>Hit Points</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          <div className="cs-hp-modal-main">
            <HPDisplay
              currentHP={currentHP}
              tempHP={tempHP}
              effectiveMaxHP={effectiveMaxHP}
              onCurrentHPChange={handleCurrentHPChange}
              onTempHPChange={handleTempHPChange}
            />

            {currentHP === 0 && (
              <DeathSavesSection
                successes={character.deathSaves?.successes || 0}
                failures={character.deathSaves?.failures || 0}
                onSuccessChange={handleDeathSaveSuccessChange}
                onFailureChange={handleDeathSaveFailureChange}
              />
            )}

            <HealDamageActions
              amount={amount}
              onAmountChange={setAmount}
              onHeal={handleHeal}
              onDamage={handleDamage}
            />

            {/* Hit Dice - always use groups (works for both single and multiclass) */}
            <HitDiceSection groups={hitDiceGroups} />

            <div className="cs-rest-buttons">
              <button
                className="cs-short-rest-btn"
                onClick={toggleShortRestDialog}
              >
                ☀️ Short Rest
              </button>
              <button className="cs-long-rest-btn" onClick={handleLongRest}>
                🌙 Long Rest
              </button>
            </div>

            {showShortRestDialog && (
              <div className="cs-short-rest-dialog">
                <div className="cs-short-rest-header">
                  <span>Short Rest</span>
                  <button
                    className="cs-short-rest-close"
                    onClick={() => toggleShortRestDialog()}
                  >
                    ×
                  </button>
                </div>
                <div className="cs-short-rest-content">
                  {/* Dice type selector for multiclass */}
                  {hasMultipleClasses && hitDiceGroups.length > 1 && (
                    <div className="cs-short-rest-type-selector">
                      <label>Hit Dice Type:</label>
                      <div className="cs-dice-type-buttons">
                        {hitDiceGroups.map((group) => {
                          const remaining = group.total - group.used;
                          return (
                            <button
                              key={group.type}
                              className={`cs-dice-type-btn ${shortRestDiceType === group.type ? 'active' : ''}`}
                              onClick={() => {
                                setShortRestDiceType(group.type);
                                setShortRestDiceCount(Math.min(shortRestDiceCount, remaining));
                              }}
                              disabled={remaining <= 0}
                            >
                              {group.type} ({remaining})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <label>Hit Dice to spend:</label>
                  <div className="cs-short-rest-dice-selector">
                    <button
                      className="cs-dice-btn"
                      onClick={() => setShortRestDiceCount(Math.max(0, shortRestDiceCount - 1))}
                      disabled={shortRestDiceCount <= 0}
                    >
                      −
                    </button>
                    <span className="cs-dice-count">{shortRestDiceCount}</span>
                    <button
                      className="cs-dice-btn"
                      onClick={() => setShortRestDiceCount(Math.min(selectedTypeRemaining, shortRestDiceCount + 1))}
                      disabled={shortRestDiceCount >= selectedTypeRemaining}
                    >
                      +
                    </button>
                  </div>
                  <small className="cs-short-rest-info">
                    {shortRestDiceCount > 0
                      ? `Roll ${shortRestDiceCount}${shortRestDiceType} + CON mod to heal`
                      : 'Rest without spending dice (restores features only)'}
                  </small>
                </div>
                <button className="cs-short-rest-confirm" onClick={handleShortRest}>
                  {shortRestDiceCount > 0
                    ? `Use ${shortRestDiceCount} Hit ${shortRestDiceCount === 1 ? 'Die' : 'Dice'}`
                    : 'Take Short Rest'}
                </button>
              </div>
            )}
          </div>

          <HPSettingsSection
            maxHP={maxHP}
            hpBonus={hpBonus}
            onMaxHPChange={handleMaxHPChange}
            onHPBonusChange={handleHPBonusChange}
            hitDiceGroups={hitDiceGroups}
            onHitDiceUsedChange={handleHitDiceUsedChange}
          />
        </div>
      </div>
    </div>
  );
}
