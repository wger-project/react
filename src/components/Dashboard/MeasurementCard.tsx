import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { DashboardCard } from "components/Dashboard/DashboardCard";
import { EmptyCard } from "components/Dashboard/EmptyCard";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { useMeasurementsCategoryQuery } from "components/Measurements/queries";
import { CategoryForm } from "components/Measurements/widgets/CategoryForm";
import { MeasurementChart } from "components/Measurements/widgets/MeasurementChart";
import i18n from "i18n";
import React from "react";
import { useTranslation } from "react-i18next";
import Slider, { Settings } from "react-slick";
import { makeLink, WgerLink } from "utils/url";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


export const MeasurementCard = () => {
    const { t } = useTranslation();
    const categoryQuery = useMeasurementsCategoryQuery();

    if (categoryQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return categoryQuery.data === null
        ? <EmptyCard
            title={t("measurements.measurements")}
            modalContent={<CategoryForm />}
            modalTitle={t("add")} />
        : <MeasurementCardContent categories={categoryQuery.data!} />;
};

const MeasurementCardContent = (props: { categories: MeasurementCategory[] }) => {
    const { t } = useTranslation();

    const settings: Settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
    };

    return (<>
        <DashboardCard
            title={t("measurements.measurements")}
            actions={
                <>
                    <Button
                        size="small"
                        href={makeLink(WgerLink.MEASUREMENT_OVERVIEW, i18n.language)}
                    >
                        {t("seeDetails")}
                    </Button>
                </>
            }
        >
            <div className="slider-container">
                <Slider {...settings}>
                    {props.categories.map(c => <MeasurementCardTableContent category={c} />)}
                </Slider>
            </div>
        </DashboardCard>
    </>);
};


const MeasurementCardTableContent = (props: { category: MeasurementCategory }) => {
    const { t } = useTranslation();

    return (<>
        <Typography variant="h6" gutterBottom>
            {props.category.name}
        </Typography>
        <MeasurementChart category={props.category} />
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>{t('date')}</TableCell>
                    <TableCell>{t('value')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {[...props.category.entries].slice(0, 5).map(entry => (
                    <TableRow key={`measurement-entry-${entry.id}`}>
                        <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                        <TableCell>{entry.value} {props.category.unit}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </>);
};