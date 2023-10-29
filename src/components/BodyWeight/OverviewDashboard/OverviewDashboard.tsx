import { Box } from "@mui/material";
import { useBodyWeightQuery } from "components/BodyWeight/queries";
import { WeightTableDashboard } from "components/BodyWeight/TableDashboard/TableDashboard";
import { WeightChart } from "components/BodyWeight/WeightChart";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import React from 'react';

export const OverviewDashboard = () => {
    const weightyQuery = useBodyWeightQuery();

    return weightyQuery.isLoading
        ? <LoadingPlaceholder />
        : <div>
            <WeightChart weights={weightyQuery.data!} height={200} />
            <Box sx={{ mt: 2, }}>
                <WeightTableDashboard weights={weightyQuery.data!} />
            </Box>
        </div>;
};