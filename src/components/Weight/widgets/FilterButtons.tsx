import { Button, ButtonGroup } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useTranslation } from "react-i18next";

export type FilterType = 'lastYear' | 'lastHalfYear' | 'lastMonth' | 'lastWeek' | '';

export interface FilterButtonsProps {
    currentFilter: FilterType;
    onFilterChange: (newFilter: FilterType) => void;
}

export const FilterButtons = ({ currentFilter, onFilterChange }: FilterButtonsProps) => {

    const [t] = useTranslation();

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
                onClick={() => handleFilterChange('')}
                color={currentFilter === '' ? 'primary' : 'inherit'}
                variant={currentFilter === '' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }}
            >
                {t('all')}
            </Button>
            <Button
                onClick={() => handleFilterChange('lastYear')}
                color={currentFilter === 'lastYear' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastYear' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }}
            >
                {t('lastYear')}
            </Button>
            <Button
                onClick={() => handleFilterChange('lastHalfYear')}
                color={currentFilter === 'lastHalfYear' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastHalfYear' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }}
            >
                {t('lastHalfYear')}
            </Button>
            <Button
                onClick={() => handleFilterChange('lastMonth')}
                color={currentFilter === 'lastMonth' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastMonth' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }}
            >
                {t('lastMonth')}
            </Button>
            <Button
                onClick={() => handleFilterChange('lastWeek')}
                color={currentFilter === 'lastWeek' ? 'primary' : 'inherit'}
                variant={currentFilter === 'lastWeek' ? 'contained' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }}
            >
                {t('lastWeek')}
            </Button>
        </ButtonGroup>
    );
};
