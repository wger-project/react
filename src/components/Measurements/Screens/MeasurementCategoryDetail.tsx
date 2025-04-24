import { Stack, } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { useMeasurementsQuery } from "components/Measurements/queries";
import { CategoryDetailDataGrid } from "components/Measurements/widgets/CategoryDetailDataGrid";
import { CategoryDetailDropdown } from "components/Measurements/widgets/CategoryDetailDropdown";
import { AddMeasurementEntryFab } from "components/Measurements/widgets/fab";
import { MeasurementChart } from "components/Measurements/widgets/MeasurementChart";
import React from "react";
import { useParams } from "react-router-dom";

export const MeasurementCategoryDetail = () => {
    const params = useParams<{ categoryId: string }>();
    const categoryId = parseInt(params.categoryId ?? '');
    if (Number.isNaN(categoryId)) {
        return <p>Please pass an integer as the category id.</p>;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const categoryQuery = useMeasurementsQuery(categoryId);

    if (categoryQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return <WgerContainerRightSidebar
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
