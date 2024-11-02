// components/BodyWeight/widgets/FilterButtons.tsx

import { Button, ButtonGroup } from "@mui/material";
import { useTheme } from '@mui/material/styles';

export const FilterButtons = ({ currentFilter, onFilterChange }) => {
    const theme = useTheme(); // Get the theme

    return (
        <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
            <Button
                onClick={() => onFilterChange('all')}
                color={currentFilter === 'all' ? 'primary' : 'inherit'}
                variant={currentFilter === 'all' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }} 
            >
                All
            </Button>
            <Button
                onClick={() => onFilterChange('lastYear')}
                color={currentFilter === 'lastYear' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastYear' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }} 
            >
                Last Year
            </Button>
            <Button
                onClick={() => onFilterChange('lastHalfYear')}
                color={currentFilter === 'lastHalfYear' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastHalfYear' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }} 
            >
                Last 6 Months
            </Button>
            <Button
                onClick={() => onFilterChange('lastMonth')}
                color={currentFilter === 'lastMonth' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastMonth' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }} 
            >
                Last Month
            </Button>
            <Button
                onClick={() => onFilterChange('lastWeek')}
                color={currentFilter === 'lastWeek' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastWeek' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }} 
            >
                Last Week
            </Button>
        </ButtonGroup>
    );
};
