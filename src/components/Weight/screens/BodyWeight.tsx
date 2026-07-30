import { Box, Stack } from "@mui/material";
import { useBodyWeightQuery, useDisplayWeightUnit } from "@/components/Weight/queries";
import { WeightTable } from "@/components/Weight/widgets/Table";
import { WeightChart } from "@/components/Weight/widgets/WeightChart";
import { AddBodyWeightEntryFab } from "@/components/Weight/widgets/fab";
import { FilterButtons, FilterType } from "@/components/Weight/widgets/FilterButtons";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "@/core/ui/Widgets/Container";
import { OverviewEmpty } from "@/core/ui/Widgets/OverviewEmpty";
import { useState } from "react";
import { useTranslation } from "react-i18next";


export const BodyWeight = () => {
    const [t] = useTranslation();
    const [filter, setFilter] = useState<FilterType>('lastYear');
    const weightyQuery = useBodyWeightQuery(filter);
    const displayUnit = useDisplayWeightUnit();
    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
    };

    if (weightyQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return <WgerContainerRightSidebar
        title={t("weight")}
        mainContent={<Stack spacing={2}>
            <FilterButtons currentFilter={filter} onFilterChange={handleFilterChange} />
            {weightyQuery.data!.length === 0 && <OverviewEmpty />}
            {weightyQuery.data!.length !== 0 && <>
                <WeightChart weights={weightyQuery.data!} unit={displayUnit} />
                <Box sx={{ mt: 4 }} />
                <WeightTable weights={weightyQuery.data!} unit={displayUnit} />
            </>}
        </Stack>
        }
        fab={<AddBodyWeightEntryFab />}
    />;
};