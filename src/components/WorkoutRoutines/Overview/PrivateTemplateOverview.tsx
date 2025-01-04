import { List, Paper, } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { OverviewEmpty } from "components/Core/Widgets/OverviewEmpty";
import { AddRoutineFab } from "components/WorkoutRoutines/Overview/Fab";
import { RoutineList } from "components/WorkoutRoutines/Overview/RoutineOverview";
import { usePrivateRoutinesShallowQuery } from "components/WorkoutRoutines/queries/routines";
import React from "react";
import { useTranslation } from "react-i18next";
import { WgerLink } from "utils/url";


export const PrivateTemplateOverview = () => {
    const routineQuery = usePrivateRoutinesShallowQuery();
    const [t] = useTranslation();

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }


    return <WgerContainerRightSidebar
        title={t("routines.templates")}
        mainContent={<>
            {routineQuery.data!.length === 0
                ? <OverviewEmpty />
                : <Paper>
                    <List sx={{ py: 0 }} key={'abc'}>
                        {routineQuery.data!.map(r => <RoutineList
                            routine={r}
                            key={r.id}
                            linkDestination={WgerLink.TEMPLATE_DETAIL} />
                        )}
                    </List>
                </Paper>}
        </>}
        fab={<AddRoutineFab />}
    />;
};
