import React, { useState, useEffect } from 'react';
import { Box, Stack } from '@mui/material';
import { useBodyWeightQuery } from 'components/BodyWeight/queries';
import { WeightTable } from 'components/BodyWeight/Table';
import { WeightChart } from 'components/BodyWeight/WeightChart';
import WeightFilter from 'components/BodyWeight/WeightFilter';
import { AddBodyWeightEntryFab } from 'components/BodyWeight/widgets/fab';
import { LoadingPlaceholder } from 'components/Core/LoadingWidget/LoadingWidget';
import { WgerContainerRightSidebar } from 'components/Core/Widgets/Container';
import { OverviewEmpty } from 'components/Core/Widgets/OverviewEmpty';
import { useTranslation } from 'react-i18next';
import { WeightEntry } from 'components/BodyWeight/model';

export const BodyWeight = () => {
  const [t] = useTranslation();
  const weightyQuery = useBodyWeightQuery();
  const [filteredData, setFilteredData] = useState<WeightEntry[]>([]);

  useEffect(() => {
    if (weightyQuery.data) {
      setFilteredData(weightyQuery.data);
    }
  }, [weightyQuery.data]);

  const handleFilter = (filter: string) => {
    const now = new Date();
    let filteredWeights: WeightEntry[] = [];
    if (weightyQuery.data) {
      switch (filter) {
        case 'year':
          filteredWeights = weightyQuery.data.filter((entry) =>
            new Date(entry.date) >= new Date(now.setFullYear(now.getFullYear() - 1))
          );
          break;
        case 'sixMonths':
          filteredWeights = weightyQuery.data.filter((entry) =>
            new Date(entry.date) >= new Date(now.setMonth(now.getMonth() - 6))
          );
          break;
        case 'month':
          filteredWeights = weightyQuery.data.filter((entry) =>
            new Date(entry.date) >= new Date(now.setMonth(now.getMonth() - 1))
          );
          break;
        case 'all':
        default:
          filteredWeights = weightyQuery.data;
      }
      setFilteredData(filteredWeights);
    }
  };

  return weightyQuery.isLoading ? (
    <LoadingPlaceholder />
  ) : (
    <WgerContainerRightSidebar
      title={t('weight')}
      mainContent={
        <Stack spacing={2}>
          <WeightFilter onFilter={handleFilter} />
          {filteredData.length === 0 && <OverviewEmpty />}
          <WeightChart weights={filteredData} />
          <Box sx={{ mt: 4 }} />
          <WeightTable weights={filteredData} />
        </Stack>
      }
      fab={<AddBodyWeightEntryFab />}
    />
  );
};
