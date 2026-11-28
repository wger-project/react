import { limitsFor, MetricType } from "@/components/Measurements/models/Category";
import { numberDecimalLocale } from "@/core/lib/numbers";
import i18n, { TFunction } from "i18next";
import { localeNumber } from "@/core/forms/formUtils";

/**
 * The yup rule for a value of this metric type: the bounds from limitsFor,
 * with one wording for every form and the grid, each message carrying the
 * unit the value is entered in.
 *
 * The unit picks the bounds (body weight has one set per unit); unitLabel
 * overrides what the message shows, e.g. a translated unit name.
 */
export function limitsSchema(
    type: MetricType,
    unit: string | undefined,
    t: TFunction,
    unitLabel?: string,
) {
    const limits = limitsFor(type, unit);
    const label = unitLabel ?? unit ?? '';
    const suffixed = (value: number) => {
        const number = numberDecimalLocale(value, i18n.language);
        return label ? `${number} ${label}` : number;
    };

    return localeNumber()
        .typeError(t('forms.fieldRequired'))
        .required(t('forms.fieldRequired'))
        .min(limits.min, t('forms.minValue', { value: suffixed(limits.min) }))
        .max(limits.max, t('forms.maxValue', { value: suffixed(limits.max) }));
}
