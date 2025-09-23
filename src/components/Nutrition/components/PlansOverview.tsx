import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Divider, List, ListItem, ListItemButton, ListItemText, Paper, Stack } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { OverviewEmpty } from "components/Core/Widgets/OverviewEmpty";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import { useFetchNutritionalPlansQuery } from "components/Nutrition/queries";
import { AddNutritionalPlanFab } from "components/Nutrition/widgets/Fab";
import React from "react";
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";

export const PlansOverview = () => {
    const plansQuery = useFetchNutritionalPlansQuery();
    const [t] = useTranslation();


    return plansQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={t("nutrition.plans")}
            mainContent={<Stack spacing={2}>
                {plansQuery.data?.length === 0 && <OverviewEmpty />}
                <PlanList plans={plansQuery.data!} />
            </Stack>
            }
            fab={<AddNutritionalPlanFab />}
        />;
};


const PlanListItem = (props: { plan: NutritionalPlan }) => {
    const [t, i18n] = useTranslation();
    const detailUrl = makeLink(WgerLink.NUTRITION_DETAIL, i18n.language, { id: props.plan.id! });

    return <>
        <ListItem sx={{ p: 0 }}>
            <ListItemButton component="a" href={detailUrl}>
                <ListItemText
                    primary={props.plan.description !== '' ? props.plan.description : t('routines.routine')}
                    secondary={
                        props.plan.end
                            ? `${props.plan.start.toLocaleDateString()} – ${props.plan.end.toLocaleDateString()}`
                            : `${props.plan.start.toLocaleDateString()}`
                    }
                />
                <ChevronRightIcon />
            </ListItemButton>
        </ListItem>
        <Divider component="li" />
    </>;
};

const PlanList = (props: { plans: NutritionalPlan[] }) => {

    return <Paper>
        <List sx={{ py: 0 }} key={'abc'}>
            {props.plans.map((plan) => <PlanListItem plan={plan} key={plan.id} />)}
        </List>
    </Paper>;
};