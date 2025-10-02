'use client';

import React, { useState } from 'react';
import AdminModal from './AdminModal';
import AdminButton from './AdminButton';
import AdminInput from './AdminInput';
import AdminSelect from './AdminSelect';

export interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: { label: string; value: string }[];
  value?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, string>;
}

export interface AdminFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FilterField[];
  onApply: (filters: Record<string, string>) => void;
  onReset?: () => void;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string, filters: Record<string, string>) => void;
}

export default function AdminFilterModal({
  isOpen,
  onClose,
  fields,
  onApply,
  onReset,
  savedFilters = [],
  onSaveFilter,
}: AdminFilterModalProps) {
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.value || '' }), {})
  );
  const [filterName, setFilterName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleFieldChange = (name: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApply(filterValues);
    onClose();
  };

  const handleReset = () => {
    const resetValues = fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {});
    setFilterValues(resetValues);
    onReset?.();
  };

  const handleSave = () => {
    if (filterName.trim() && onSaveFilter) {
      onSaveFilter(filterName, filterValues);
      setFilterName('');
      setShowSaveInput(false);
    }
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    setFilterValues(filter.filters);
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gelişmiş Filtreler"
      size="lg"
      footer={
        <>
          <AdminButton variant="secondary" onClick={handleReset}>
            Sıfırla
          </AdminButton>
          <AdminButton variant="primary" onClick={handleApply}>
            Uygula
          </AdminButton>
        </>
      }
    >
      <div className="space-y-6">
        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Kayıtlı Filtreler
            </label>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => handleLoadFilter(filter)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(field => (
            <div key={field.name}>
              {field.type === 'select' ? (
                <AdminSelect
                  label={field.label}
                  value={filterValues[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  options={field.options || []}
                />
              ) : (
                <AdminInput
                  label={field.label}
                  type={field.type}
                  value={filterValues[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Save Filter */}
        {onSaveFilter && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            {showSaveInput ? (
              <div className="flex items-end space-x-2">
                <AdminInput
                  label="Filtre Adı"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Örn: Aktif Kullanıcılar"
                />
                <AdminButton onClick={handleSave} disabled={!filterName.trim()}>
                  Kaydet
                </AdminButton>
                <AdminButton variant="secondary" onClick={() => setShowSaveInput(false)}>
                  İptal
                </AdminButton>
              </div>
            ) : (
              <AdminButton variant="secondary" onClick={() => setShowSaveInput(true)}>
                Filtreyi Kaydet
              </AdminButton>
            )}
          </div>
        )}
      </div>
    </AdminModal>
  );
}
