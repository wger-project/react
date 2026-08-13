import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime } from "luxon";
import React from 'react';
import { useTranslation } from "react-i18next";

/**
 * When an entry was measured: the date field every measurement form has.
 *
 * Keeps what the picker holds, which an incomplete input leaves empty, and
 * hands the form only the dates it can store.
 */
export const EntryDateTimeField = (props: { initialDate: Date, onChange: (date: Date) => void }) => {
    const [t, i18n] = useTranslation();
    const [value, setValue] = React.useState<DateTime | null>(DateTime.fromJSDate(props.initialDate));

    return <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
        <DateTimePicker
            label={t('date')}
            value={value}
            slotProps={{ textField: { variant: 'outlined' } }}
            disableFuture={true}
            onChange={(newValue) => {
                if (newValue) {
                    props.onChange(newValue.toJSDate());
                }
                setValue(newValue);
            }}
        />
    </LocalizationProvider>;
};
