import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { DashboardCard } from "@/components/Dashboard/DashboardCard";
import { EmptyCard } from "@/components/Dashboard/EmptyCard";
import {
    CategoryForm,
    MeasurementCategory,
    MeasurementChart,
    useMeasurementsCategoryQuery
} from "@/components/Measurements";
import i18n from "@/i18n";
import { makeLink, WgerLink } from "@/core/lib/url";
import "slick-carousel/slick/slick.css";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import Slider, { Settings } from "react-slick";
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

    // TODO: is there a better solution for this?
    // Workaround for react-slick import issue where it returns a module object
    // instead of the component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SlickSlider = (Slider as any).default ?? Slider;

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
                <SlickSlider {...settings}>
                    {props.categories.map(c => <MeasurementCardTableContent category={c} />)}
                </SlickSlider>
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