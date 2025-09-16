import { List, Paper, } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { OverviewEmpty } from "components/Core/Widgets/OverviewEmpty";
import { AddPublicTemplateFab } from "components/WorkoutRoutines/Overview/Fab";
import { RoutineList } from "components/WorkoutRoutines/Overview/RoutineOverview";
import { usePublicRoutinesShallowQuery } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { WgerLink } from "utils/url";


export const PublicTemplateOverview = () => {
    const routineQuery = usePublicRoutinesShallowQuery();
    const [t] = useTranslation();

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }


    return <WgerContainerRightSidebar
        title={t("routines.publicTemplates")}
        mainContent={<>
            {routineQuery.data!.length === 0
                ? <OverviewEmpty />
                : <Paper>
                    <List sx={{ py: 0 }} key={'abc'}>
                        {routineQuery.data!.map(r => <RoutineList
                            routine={r}
                            linkDestination={WgerLink.TEMPLATE_DETAIL}
                            showTemplateChip={false}
                            key={r.id} />
                        )}
                    </List>
                </Paper>}
        </>}
        fab={<AddPublicTemplateFab />}
    />;
};
