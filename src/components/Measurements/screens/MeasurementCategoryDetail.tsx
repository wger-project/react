import { Stack, Typography } from "@mui/material";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "@/core/ui/Widgets/Container";
import { useMeasurementsQuery } from "@/components/Measurements/queries";
import { CategoryDetailDataGrid } from "@/components/Measurements/widgets/CategoryDetailDataGrid";
import { CategoryDetailDropdown } from "@/components/Measurements/widgets/CategoryDetailDropdown";
import { AddMeasurementEntryFab } from "@/components/Measurements/widgets/fab";
import { MeasurementChart } from "@/components/Measurements/widgets/MeasurementChart";
import React from "react";
import { useParams } from "react-router-dom";

export const MeasurementCategoryDetail = () => {
    const params = useParams<{ categoryId: string }>();
    const categoryId = params.categoryId ?? '';
    if (!categoryId) {
        return <p>Please pass a category id.</p>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const categoryQuery = useMeasurementsQuery(categoryId);

    if (categoryQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return <WgerContainerRightSidebar
        title={categoryQuery.data!.name}
        // official categories may neither be renamed nor deleted
        optionsMenu={categoryQuery.data!.isOfficial
            ? undefined
            : <CategoryDetailDropdown category={categoryQuery.data!} />}
        mainContent={
            <Stack spacing={2}>
                <MeasurementChart category={categoryQuery.data!} />
                {categoryQuery.data!.isGroup
                    ? categoryQuery.data!.children.map(child =>
                        <React.Fragment key={child.id}>
                            <Typography variant="h5">{child.name}</Typography>
                            <CategoryDetailDataGrid category={child} />
                        </React.Fragment>)
                    : <CategoryDetailDataGrid category={categoryQuery.data!} />}
            </Stack>
        }
        fab={<AddMeasurementEntryFab category={categoryQuery.data!} />}
    />;
};
