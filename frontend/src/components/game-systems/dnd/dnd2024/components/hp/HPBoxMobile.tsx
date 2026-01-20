// D&D 2024 - HP Box Mobile Component

import type { Character } from 'shared';
import './HP.scss';

interface HPBoxMobileProps {
  character: Character;
  onClick: () => void;
}

export function HPBoxMobile({ character, onClick }: HPBoxMobileProps) {
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
        {character.hp.temp > 0 && ` (${character.hp.temp})`}
      </div>
      <div className="cs-hp-mobile-label">HP</div>
    </div>
  );
}
