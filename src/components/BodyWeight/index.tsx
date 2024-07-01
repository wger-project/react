import { Box, Stack } from "@mui/material";
import { useBodyWeightQuery } from "components/BodyWeight/queries";
import { WeightTable } from "components/BodyWeight/Table";
import { WeightChart } from "components/BodyWeight/WeightChart";
import { AddBodyWeightEntryFab } from "components/BodyWeight/widgets/fab";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { OverviewEmpty } from "components/Core/Widgets/OverviewEmpty";
import { useTranslation } from "react-i18next";

export const BodyWeight = () => {
    const [t] = useTranslation();
    const weightyQuery = useBodyWeightQuery();

    return weightyQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={t("weight")}
            mainContent={<Stack spacing={2}>
                {weightyQuery.data!.length === 0 && <OverviewEmpty />}
                <WeightChart weights={weightyQuery.data!} />
                <Box sx={{ mt: 4 }} />
                <WeightTable weights={weightyQuery.data!} />
            </Stack>
            }
            fab={<AddBodyWeightEntryFab />}
        />;
};