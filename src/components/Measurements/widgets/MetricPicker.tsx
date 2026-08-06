import React from "react";
import { Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import StraightenIcon from "@mui/icons-material/Straighten";
import { useTranslation } from "react-i18next";
import {
    defaultsForMetricType,
    isPickableMetricType,
    MeasurementCategory,
    METRIC_TYPES,
    MetricType
} from "@/components/Measurements/models/Category";
import {
    useAddMeasurementCategoryQuery,
    useMeasurementsCategoryQuery
} from "@/components/Measurements/queries";
import { CategoryForm } from "@/components/Measurements/widgets/CategoryForm";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { makeLink, WgerLink } from "@/core/lib/url";
import { useNavigate } from "react-router-dom";

/**
 * Starts a new measurement category: either one of the known metrics or a
 * free-form one.
 *
 * A known metric needs no form, its name, unit and chart follow from the metric
 * type. The type is also what the health import and the value limits hang off
 * and cannot be changed afterwards, so it is picked here instead of being one
 * field among others.
 */
export const NewCategoryPicker = ({ closeFn }: { closeFn?: () => void }) => {

    const [t, i18n] = useTranslation();
    const navigate = useNavigate();
    const [isCustom, setIsCustom] = React.useState(false);
    const categoryQuery = useMeasurementsCategoryQuery();
    const addCategoryQuery = useAddMeasurementCategoryQuery();

    if (isCustom) {
        return <CategoryForm closeFn={closeFn} />;
    }

    if (categoryQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    const taken = new Set((categoryQuery.data ?? []).map(c => c.metricType));

    return <List>
        {METRIC_TYPES.filter(isPickableMetricType).map((metricType: MetricType) => {
            const defaults = defaultsForMetricType(metricType);
            return <ListItemButton
                key={metricType}
                disabled={taken.has(metricType)}
                onClick={() => addCategoryQuery.mutate(
                    new MeasurementCategory(null, defaults.name, defaults.unit, metricType),
                    {
                        // Straight to the new category: the overview is long
                        // enough that a row appearing somewhere in it does not
                        // read as "something happened"
                        onSuccess: category => {
                            closeFn?.();
                            navigate(makeLink(
                                WgerLink.MEASUREMENT_DETAIL,
                                i18n.language,
                                { id: category.id! },
                            ));
                        },
                    },
                )}
            >
                <ListItemText
                    primary={t(`measurements.metricTypes.${metricType}`)}
                    secondary={taken.has(metricType)
                        ? t('measurements.metricAlreadyTracked')
                        : defaults.unit}
                />
            </ListItemButton>;
        })}
        <Divider />
        <ListItemButton onClick={() => setIsCustom(true)}>
            <ListItemIcon>
                <StraightenIcon />
            </ListItemIcon>
            <ListItemText
                primary={t('measurements.customMeasurement')}
                secondary={t('measurements.categoryFormHelpText')}
            />
        </ListItemButton>
    </List>;
};
