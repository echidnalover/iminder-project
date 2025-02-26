import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export type TimeRange = {
  from: Date;
  to: Date;
};

type TimeFilterOption = 'today' | 'week' | 'month' | 'custom';

interface Props {
  onChange: (range: TimeRange) => void;
}

export function TimeFilter({ onChange }: Props) {
  const [selectedOption, setSelectedOption] = React.useState<TimeFilterOption>('week');
  const [customRange, setCustomRange] = React.useState<TimeRange>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const handleOptionChange = (value: TimeFilterOption) => {
    setSelectedOption(value);
    if (value !== 'custom') {
      const range = getTimeRange(value);
      onChange(range);
    }
  };

  const handleCustomRangeChange = (range: TimeRange) => {
    setCustomRange(range);
    onChange(range);
  };

  const getTimeRange = (option: TimeFilterOption): TimeRange => {
    const now = new Date();
    switch (option) {
      case 'today':
        return {
          from: startOfDay(now),
          to: endOfDay(now),
        };
      case 'week':
        return {
          from: startOfWeek(now),
          to: endOfWeek(now),
        };
      case 'month':
        return {
          from: startOfMonth(now),
          to: endOfMonth(now),
        };
      default:
        return customRange;
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Select value={selectedOption} onValueChange={handleOptionChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {selectedOption === 'custom' && (
        <DatePickerWithRange
          value={customRange}
          onChange={handleCustomRangeChange}
        />
      )}
    </div>
  );
}
