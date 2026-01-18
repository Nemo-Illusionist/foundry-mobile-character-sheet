// D&D 2024 - Biography Tab Component

import { useState, useEffect } from 'react';
import { updateCharacter } from '../../../../../../services/characters.service';
import type { Character } from 'shared';

interface BiographyTabProps {
  character: Character;
  gameId: string;
}

const ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
  'Unaligned',
] as const;

// Hook for number input with local state (allows clearing)
function useNumberInput(externalValue: number | undefined, onCommit: (value: number | undefined) => void) {
  const [localValue, setLocalValue] = useState(externalValue?.toString() ?? '');

  useEffect(() => {
    setLocalValue(externalValue?.toString() ?? '');
  }, [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*$/.test(val)) {
      setLocalValue(val);
    }
  };

  const handleBlur = () => {
    if (localValue === '') {
      onCommit(undefined);
    } else {
      const num = parseInt(localValue, 10);
      onCommit(isNaN(num) ? undefined : num);
    }
  };

  return { value: localValue, onChange: handleChange, onBlur: handleBlur };
}

export function BiographyTab({ character, gameId }: BiographyTabProps) {
  const biography = character.biography || {};
  const appearance = biography.appearance || {};

  const updateBiography = async (field: string, value: string) => {
    await updateCharacter(gameId, character.id, {
      biography: {
        ...biography,
        [field]: value,
      },
    });
  };

  const updateAppearance = async (field: string, value: string | number | undefined) => {
    await updateCharacter(gameId, character.id, {
      biography: {
        ...biography,
        appearance: {
          ...appearance,
          [field]: value,
        },
      },
    });
  };

  const ageInput = useNumberInput(appearance.age, (val) => updateAppearance('age', val));
  const weightInput = useNumberInput(appearance.weight, (val) => updateAppearance('weight', val));

  return (
    <div className="cs-biography-tab">
      {/* Alignment */}
      <div className="cs-bio-section">
        <label className="cs-bio-label">Alignment</label>
        <select
          className="cs-bio-select"
          value={biography.alignment || ''}
          onChange={(e) => updateBiography('alignment', e.target.value)}
        >
          <option value="">— Select —</option>
          {ALIGNMENTS.map((align) => (
            <option key={align} value={align}>{align}</option>
          ))}
        </select>
      </div>

      {/* Appearance */}
      <div className="cs-bio-section">
        <div className="cs-bio-section-header">Appearance</div>
        <div className="cs-bio-appearance-grid">
          <div className="cs-bio-field">
            <label>Age</label>
            <input
              type="text"
              inputMode="numeric"
              value={ageInput.value}
              onChange={ageInput.onChange}
              onBlur={ageInput.onBlur}
              placeholder="—"
            />
          </div>
          <div className="cs-bio-field">
            <label>Height</label>
            <input
              type="text"
              value={appearance.height || ''}
              onChange={(e) => updateAppearance('height', e.target.value)}
              placeholder="—"
            />
          </div>
          <div className="cs-bio-field">
            <label>Weight</label>
            <input
              type="text"
              inputMode="numeric"
              value={weightInput.value}
              onChange={weightInput.onChange}
              onBlur={weightInput.onBlur}
              placeholder="—"
            />
          </div>
          <div className="cs-bio-field">
            <label>Eyes</label>
            <input
              type="text"
              value={appearance.eyes || ''}
              onChange={(e) => updateAppearance('eyes', e.target.value)}
              placeholder="—"
            />
          </div>
          <div className="cs-bio-field">
            <label>Skin</label>
            <input
              type="text"
              value={appearance.skin || ''}
              onChange={(e) => updateAppearance('skin', e.target.value)}
              placeholder="—"
            />
          </div>
          <div className="cs-bio-field">
            <label>Hair</label>
            <input
              type="text"
              value={appearance.hair || ''}
              onChange={(e) => updateAppearance('hair', e.target.value)}
              placeholder="—"
            />
          </div>
        </div>
        <textarea
          className="cs-bio-textarea"
          value={appearance.description || ''}
          onChange={(e) => updateAppearance('description', e.target.value)}
          placeholder="Physical description..."
          rows={2}
        />
      </div>

      {/* Personality Traits */}
      <div className="cs-bio-section">
        <label className="cs-bio-label">Personality Traits</label>
        <textarea
          className="cs-bio-textarea"
          value={biography.personalityTraits || ''}
          onChange={(e) => updateBiography('personalityTraits', e.target.value)}
          placeholder="Describe your character's personality..."
          rows={2}
        />
      </div>

      {/* Ideals */}
      <div className="cs-bio-section">
        <label className="cs-bio-label">Ideals</label>
        <textarea
          className="cs-bio-textarea"
          value={biography.ideals || ''}
          onChange={(e) => updateBiography('ideals', e.target.value)}
          placeholder="What drives your character?"
          rows={2}
        />
      </div>

      {/* Bonds */}
      <div className="cs-bio-section">
        <label className="cs-bio-label">Bonds</label>
        <textarea
          className="cs-bio-textarea"
          value={biography.bonds || ''}
          onChange={(e) => updateBiography('bonds', e.target.value)}
          placeholder="Connections to people, places, or things..."
          rows={2}
        />
      </div>

      {/* Flaws */}
      <div className="cs-bio-section">
        <label className="cs-bio-label">Flaws</label>
        <textarea
          className="cs-bio-textarea"
          value={biography.flaws || ''}
          onChange={(e) => updateBiography('flaws', e.target.value)}
          placeholder="Weaknesses or vices..."
          rows={2}
        />
      </div>

      {/* Backstory */}
      <div className="cs-bio-section">
        <label className="cs-bio-label">Backstory</label>
        <textarea
          className="cs-bio-textarea"
          value={biography.backstory || ''}
          onChange={(e) => updateBiography('backstory', e.target.value)}
          placeholder="Your character's history..."
          rows={4}
        />
      </div>

      {/* Languages */}
      <div className="cs-bio-section">
        <label className="cs-bio-label">Languages</label>
        <textarea
          className="cs-bio-textarea"
          value={biography.languages || ''}
          onChange={(e) => updateBiography('languages', e.target.value)}
          placeholder="Common, Elvish, Dwarvish..."
          rows={1}
        />
      </div>

      {/* Allies & Organizations */}
      <div className="cs-bio-section">
        <label className="cs-bio-label">Allies & Organizations</label>
        <textarea
          className="cs-bio-textarea"
          value={biography.alliesAndOrganizations || ''}
          onChange={(e) => updateBiography('alliesAndOrganizations', e.target.value)}
          placeholder="Factions, guilds, allies..."
          rows={3}
        />
      </div>
    </div>
  );
}
