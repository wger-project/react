import { useTranslation } from "react-i18next";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { Divider, List, ListItem, ListItemButton, ListItemText, Paper, Stack } from "@mui/material";
import { OverviewEmpty } from "components/Core/Widgets/OverviewEmpty";
import { AddMeasurementCategoryFab } from "components/Measurements/widgets/fab";
import React from "react";
import { useNutritionalPlansQuery } from "components/Nutrition/queries";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export const PlansOverview = () => {
    const plansQuery = useNutritionalPlansQuery();
    const [t] = useTranslation();

    return plansQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={t("nutrition.plans")}
            mainContent={<Stack spacing={2}>
                {plansQuery.data!.length === 0 && <OverviewEmpty />}
                <PlanList plans={plansQuery.data!} />
            </Stack>
            }
            fab={<AddMeasurementCategoryFab />}
        />;
};


const PlanList = (props: { plans: NutritionalPlan[] }) => {

    const [t] = useTranslation();


    return <Paper>
        <List sx={{ py: 0 }} key={'abc'}>
            {props.plans.map((plan) => <><ListItem sx={{ p: 0 }}>
                    <ListItemButton component="a" href={""}>
                        <ListItemText
                            primary={plan.description !== '' ? plan.description : t('routines.routine')}
                            secondary={plan.creationDate.toLocaleDateString()}
                        />
                        <ChevronRightIcon />
                    </ListItemButton>
                </ListItem>
                    <Divider component="li" />
                </>
            )}
        </List>
    </Paper>;
};