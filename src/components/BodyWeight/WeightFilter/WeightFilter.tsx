import React, { useState } from 'react';
import { Button, ButtonGroup, Box } from '@mui/material';

interface WeightFilterProps {
  onFilter: (filter: string) => void;
}

const WeightFilter: React.FC<WeightFilterProps> = ({ onFilter }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    onFilter(filter);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <ButtonGroup variant="outlined" aria-label="outlined primary button group">
        <Button 
          variant={activeFilter === 'all' ? 'contained' : 'outlined'} 
          onClick={() => handleFilterClick('all')}
        >
          All
        </Button>
        <Button 
          variant={activeFilter === 'year' ? 'contained' : 'outlined'} 
          onClick={() => handleFilterClick('year')}
        >
          Last Year
        </Button>
        <Button 
          variant={activeFilter === 'sixMonths' ? 'contained' : 'outlined'} 
          onClick={() => handleFilterClick('sixMonths')}
        >
          Last Six Months
        </Button>
        <Button 
          variant={activeFilter === 'month' ? 'contained' : 'outlined'} 
          onClick={() => handleFilterClick('month')}
        >
          Last Month
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default WeightFilter;
