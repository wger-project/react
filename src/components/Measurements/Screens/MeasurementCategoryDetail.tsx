import React from "react";
import { Stack, } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { useMeasurementsQuery } from "components/Measurements/queries";
import { MeasurementChart } from "components/Measurements/widgets/MeasurementChart";
import { useParams } from "react-router-dom";
import { AddMeasurementEntryFab } from "components/Measurements/widgets/fab";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { CategoryDetailDataGrid } from "components/Measurements/widgets/CategoryDetailDataGrid";
import { CategoryDetailDropdown } from "components/Measurements/widgets/CategoryDetailDropdown";

export const MeasurementCategoryDetail = () => {
    const params = useParams<{ categoryId: string }>();
    const categoryId = parseInt(params.categoryId!);
    const categoryQuery = useMeasurementsQuery(categoryId);

    return categoryQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={categoryQuery.data!.name}
            optionsMenu={<CategoryDetailDropdown category={categoryQuery.data!} />}
            mainContent={
                <Stack spacing={2}>
                    <MeasurementChart category={categoryQuery.data!} />
                    <CategoryDetailDataGrid category={categoryQuery.data!} />
                </Stack>
            }
            fab={<AddMeasurementEntryFab />}
        />;
};
