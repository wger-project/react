// components/BodyWeight/widgets/FilterButtons.tsx

import { Button, ButtonGroup } from "@mui/material";
import { useTheme } from '@mui/material/styles';

export type FilterType = 'all' | 'lastYear' | 'lastHalfYear' | 'lastMonth' | 'lastWeek' | '';

export interface FilterButtonsProps {
    currentFilter: FilterType;
    onFilterChange: (newFilter: FilterType) => void;
}

export const FilterButtons = ({ currentFilter, onFilterChange }: FilterButtonsProps) => {
    const theme = useTheme();

    // Won't call onFilterChange if the filter stays the same 
    const handleFilterChange = (newFilter: FilterType) => {
        if (currentFilter !== newFilter) {
            onFilterChange(newFilter);
        }
    };

    return (
        <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
            <Button
                onClick={() => handleFilterChange('all')}
                color={currentFilter === 'all' ? 'primary' : 'inherit'}
                variant={currentFilter === 'all' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }} 
            >
                All
            </Button>
            <Button
                onClick={() => handleFilterChange('lastYear')}
                color={currentFilter === 'lastYear' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastYear' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }} 
            >
                Last Year
            </Button>
            <Button
                onClick={() => handleFilterChange('lastHalfYear')}
                color={currentFilter === 'lastHalfYear' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastHalfYear' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }} 
            >
                Last 6 Months
            </Button>
            <Button
                onClick={() => handleFilterChange('lastMonth')}
                color={currentFilter === 'lastMonth' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastMonth' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }} 
            >
                Last Month
            </Button>
            <Button
                onClick={() => handleFilterChange('lastWeek')}
                color={currentFilter === 'lastWeek' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastWeek' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }} 
            >
                Last Week
            </Button>
        </ButtonGroup>
    );
};
