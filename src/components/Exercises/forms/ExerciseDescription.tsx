import React, { useRef } from "react";
import { useField } from "formik";
import JoditEditor from "jodit-react";
import { FormHelperText } from "@mui/material";
import { Jodit } from "jodit";
import { IJodit } from "jodit/types";

export function ExerciseDescription(props: { fieldName: string }) {

    const [field, meta, helpers] = useField(props.fieldName);
    const editor = useRef(null);

    // See https://xdsoft.net/jodit/docs/,
    const buttons = ['bold', 'italic', '|', 'ul', 'ol', '|', 'undo', 'redo'];
    const config: IJodit['options'] = {
        ...Jodit.defaultOptions, readonly: false,
        buttons: buttons,
        buttonsMD: buttons,
        buttonsSM: buttons,
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