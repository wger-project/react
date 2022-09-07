import { useTranslation } from "react-i18next";
import React, { useRef } from "react";
import { useField } from "formik";
import JoditEditor from "jodit-react";
import { FormHelperText } from "@mui/material";

export function ExerciseDescription(props: { fieldName: string }) {

    const [t] = useTranslation();
    const [field, meta, helpers] = useField(props.fieldName);
    const editor = useRef(null);

    // See https://xdsoft.net/jodit/docs/,
    const config = {
        readonly: false,
        buttons: ['bold', 'italic', '|', 'ul', 'ol', '|', 'undo', 'redo',],
        placeholder: t("description"),
        toolbarAdaptive: false,
        disablePlugins: "ordered-list",
        defaultActionOnPaste: 'insert_as_html',
    };

    return <>
        <div data-testid={'jodit-editor'}>
            <JoditEditor
                ref={editor}
                value={field.value}
                config={config}
                onBlur={(newValue) => helpers.setValue(newValue)}
                onChange={(newValue) => field.onChange(newValue)}
            />
        </div>
        {meta.touched
            && Boolean(meta.error)
            && <FormHelperText error>{meta.error}</FormHelperText>
        }
    </>;
}