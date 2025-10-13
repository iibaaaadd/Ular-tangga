import React from 'react';
import { Card, Input, Select, Button } from '../ui';

const FilterSection = ({
  title,
  children,
  showResults = false,
  totalItems = 0,
  filteredItems = 0,
  hasActiveFilters = false,
  onClearFilters,
  className = ''
}) => {
  return (
    <Card className={`mb-6 ${className}`} hoverable={false} shadow="none">
      <div className="space-y-4">
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {children}
        </div>

        {/* Results Info & Clear Button */}
        {showResults && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-gray-200 gap-3">
            <p className="text-sm text-gray-600">
              Menampilkan {filteredItems} dari {totalItems} item
            </p>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="small"
                onClick={onClearFilters}
                className="self-start sm:self-auto"
              >
                🗑️ Reset Filter
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

// Filter Item untuk konsistensi
const FilterItem = ({ label, children, className = '' }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
    </div>
  );
};

FilterSection.Item = FilterItem;

export default FilterSection;