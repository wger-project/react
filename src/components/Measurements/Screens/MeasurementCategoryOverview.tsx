import React from "react";
import { Button, Card, CardActions, CardContent, CardHeader, IconButton, Stack, } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from "react-i18next";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { useMeasurementsCategoryQuery } from "components/Measurements/queries";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { MeasurementChart } from "components/Measurements/widgets/MeasurementChart";
import { OverviewEmpty } from "components/Core/Widgets/OverviewEmpty";
import { AddMeasurementCategoryFab } from "components/Measurements/widgets/fab";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { makeLink, WgerLink } from "utils/url";
import { Link } from "react-router-dom";
import { t } from "i18next";


const CategoryList = (props: { category: MeasurementCategory }) => {

    const { i18n } = useTranslation();

    return <Card>
        <CardHeader title={props.category.name} subheader={props.category.unit} />
        <CardContent>

            <MeasurementChart category={props.category} />
        </CardContent>
        <CardActions disableSpacing sx={{ justifyContent: "space-between" }}>
            <Button size="small">
                <Link to={makeLink(WgerLink.MEASUREMENT_DETAIL, i18n.language, { id: props.category.id })}>
                    {t("seeDetails")}
                </Link>
            </Button>

            <IconButton>
                <AddIcon />
            </IconButton>
        </CardActions>
    </Card>;
};
export const MeasurementCategoryOverview = () => {
    const categoryQuery = useMeasurementsCategoryQuery();
    const [t] = useTranslation();

    return categoryQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={t("measurements.measurements")}
            mainContent={<Stack spacing={2}>
                {categoryQuery.data!.length === 0 && <OverviewEmpty />}
                {categoryQuery.data!.map(c => <CategoryList category={c} key={c.id} />)}
            </Stack>
            }
            fab={<AddMeasurementCategoryFab />}
        />;
};
