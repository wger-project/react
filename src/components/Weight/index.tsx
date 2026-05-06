import { Box, Stack } from "@mui/material";
import { useBodyWeightQuery } from "@/components/Weight/queries";
import { WeightTable } from "@/components/Weight/Table";
import { WeightChart } from "@/components/Weight/WeightChart";
import { AddBodyWeightEntryFab } from "@/components/Weight/widgets/fab";
import { FilterButtons, FilterType } from "@/components/Weight/widgets/FilterButtons";
import { LoadingPlaceholder } from "@/components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "@/components/Core/Widgets/Container";
import { OverviewEmpty } from "@/components/Core/Widgets/OverviewEmpty";
import { useState } from "react";
import { useTranslation } from "react-i18next";


export const BodyWeight = () => {
    const [t] = useTranslation();
    const [filter, setFilter] = useState<FilterType>('lastYear');
    const weightyQuery = useBodyWeightQuery(filter);
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
                <WeightChart weights={weightyQuery.data!} />
                <Box sx={{ mt: 4 }} />
                <WeightTable weights={weightyQuery.data!} />
            </>}
        </Stack>
        }
        fab={<AddBodyWeightEntryFab />}
    />;
};