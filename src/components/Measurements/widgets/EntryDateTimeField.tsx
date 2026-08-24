import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime } from "luxon";
import React from 'react';
import { useTranslation } from "react-i18next";

/**
 * When an entry was measured: the date field every measurement form has.
 *
 * Keeps what the picker holds and hands the form only the dates it can
 * store: an incomplete, unparseable or future input reaches it as null,
 * which the form schemas refuse to submit while the picker paints the
 * field red.
 */
export const EntryDateTimeField = (props: { initialDate: Date, onChange: (date: Date | null) => void }) => {
    const [t, i18n] = useTranslation();
    const [value, setValue] = React.useState<DateTime | null>(DateTime.fromJSDate(props.initialDate));

    return <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
        <DateTimePicker
            label={t('date')}
            value={value}
            slotProps={{ textField: { variant: 'outlined' } }}
            disableFuture={true}
            onChange={(newValue, context) => {
                // The picker validates for display only: without the guard a
                // reddened field still hands its value to the form
                props.onChange(
                    newValue?.isValid && !context.validationError ? newValue.toJSDate() : null
                );
                setValue(newValue);
            }}
        />
    </LocalizationProvider>;
};
