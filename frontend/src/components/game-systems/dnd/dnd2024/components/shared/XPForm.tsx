// XP Form Component - shared between ClassTab and LevelXPModal

import { Button, NumberInput } from '../../../../../shared';

interface XPFormProps {
  currentXP: number;
  onCurrentXPChange: (xp: number) => void;
  gainXPInput: number;
  onGainXPChange: (xp: number) => void;
  onUpdateXP: () => void;
  onAddXP: () => void;
  xpToNextLevel: number | null;
  globalLevel: number;
  message?: string;
  // Styling variant
  variant?: 'card' | 'modal';
}

export function XPForm({
  currentXP,
  onCurrentXPChange,
  gainXPInput,
  onGainXPChange,
  onUpdateXP,
  onAddXP,
  xpToNextLevel,
  globalLevel,
  message,
  variant = 'card',
}: XPFormProps) {
  const isModal = variant === 'modal';

  return (
    <div className={isModal ? 'cs-xp-form-modal' : 'cs-xp-form'}>
      {/* Current XP */}
      <label>Current Experience</label>
      <div className={isModal ? 'cs-xp-input-row' : 'cs-xp-row'}>
        {isModal ? (
          <NumberInput
            value={currentXP}
            onChange={onCurrentXPChange}
            min={0}
            defaultValue={0}
          />
        ) : (
          <input
            type="number"
            value={currentXP}
            onChange={(e) => onCurrentXPChange(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
          />
        )}
        <Button variant="secondary" onClick={onUpdateXP}>Update</Button>
      </div>
      {xpToNextLevel !== null && (
        <div className={isModal ? 'cs-xp-info' : 'cs-xp-help'}>
          {xpToNextLevel} XP until level {globalLevel + 1}
        </div>
      )}

      {/* Gain XP */}
      <label>Gain Experience</label>
      <div className={isModal ? 'cs-xp-input-row' : 'cs-xp-row'}>
        {isModal ? (
          <NumberInput
            value={gainXPInput}
            onChange={onGainXPChange}
            min={0}
            defaultValue={0}
            placeholder="Enter XP gained"
          />
        ) : (
          <input
            type="number"
            value={gainXPInput || ''}
            onChange={(e) => onGainXPChange(Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="0"
            min={0}
          />
        )}
        <Button onClick={onAddXP} disabled={gainXPInput <= 0}>Add</Button>
      </div>

      {/* Message */}
      {message && (
        <div className={isModal ? 'cs-message' : 'cs-xp-message'}>{message}</div>
      )}
    </div>
  );
}
