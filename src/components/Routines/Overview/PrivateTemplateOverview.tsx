import { List, Paper, } from "@mui/material";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "@/core/ui/Widgets/Container";
import { OverviewEmpty } from "@/core/ui/Widgets/OverviewEmpty";
import { AddPrivateTemplateFab } from "@/components/Routines/Overview/Fab";
import { RoutineList } from "@/components/Routines/Overview/RoutineOverview";
import { usePrivateRoutinesShallowQuery } from "@/components/Routines/queries/routines";
import React from "react";
import { useTranslation } from "react-i18next";
import { WgerLink } from "@/core/lib/url";


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
                            showTemplateChip={false}
                            showTemplateVisibility={true}
                            linkDestination={WgerLink.ROUTINE_DETAIL} />
                        )}
                    </List>
                </Paper>}
        </>}
        fab={<AddPrivateTemplateFab />}
    />;
};
