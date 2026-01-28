// D&D 2024 - Actions Tab Component

import { useActions } from '../../hooks';
import { ActionModal } from './ActionModal';
import type { Character } from 'shared';

interface ActionsTabProps {
  character: Character;
  gameId: string;
}

export function ActionsTab({ character, gameId }: ActionsTabProps) {
  const {
    editingAction,
    setEditingAction,
    filter,
    setFilter,
    filteredActions,
    addAction,
    updateAction,
    deleteAction,
    getAttackBonus,
    getDamageDisplay,
    ACTION_FILTERS,
  } = useActions(character, gameId);

  return (
    <div className="cs-actions-tab">
      {/* Filter tabs */}
      <div className="cs-tab-filters">
        {ACTION_FILTERS.map((type) => (
          <button
            key={type.id}
            className={`cs-filter-btn ${filter === type.id ? 'active' : ''}`}
            onClick={() => setFilter(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Actions table */}
      <table className="cs-data-table">
        <thead>
          <tr>
            <th className="cs-col-name">Name</th>
            <th className="cs-col-atk">Atk</th>
            <th className="cs-col-damage">Damage</th>
            <th className="cs-col-type">Type</th>
          </tr>
        </thead>
        <tbody>
          {filteredActions.length === 0 ? (
            <tr className="cs-table-empty-row">
              <td colSpan={4}>No actions</td>
            </tr>
          ) : (
            filteredActions.map((action) => (
              <tr
                key={action.id}
                className="cs-table-row"
                onClick={() => setEditingAction(action)}
              >
                <td className="cs-cell-name">{action.name || '—'}</td>
                <td>{getAttackBonus(action)}</td>
                <td>{getDamageDisplay(action)}</td>
                <td>{action.damageType || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Add button - full width */}
      <button className="cs-table-add-btn" onClick={addAction}>
        + Add Action
      </button>

      {editingAction && (
        <ActionModal
          action={editingAction}
          onUpdate={(updates) => updateAction(editingAction.id, updates)}
          onDelete={() => deleteAction(editingAction.id)}
          onClose={() => setEditingAction(null)}
        />
      )}
    </div>
  );
}
