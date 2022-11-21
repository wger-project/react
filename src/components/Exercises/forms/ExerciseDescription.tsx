import React from "react";
import { useField } from "formik";
import { FormHelperText } from "@mui/material";
import {
    BtnBold,
    BtnBulletList,
    BtnItalic,
    BtnNumberedList,
    BtnRedo,
    BtnUnderline,
    BtnUndo,
    Editor,
    EditorProps,
    EditorProvider,
    Separator,
    Toolbar,
} from "react-simple-wysiwyg";

export function ExerciseEditor(props: EditorProps) {
    return (
        <EditorProvider>
            <Editor {...props}>
                <Toolbar>
                    <BtnBold />
                    <BtnItalic />
                    <BtnUnderline />
                    <Separator />
                    <BtnBulletList />
                    <BtnNumberedList />
                    <Separator />
                    <BtnUndo />
                    <BtnRedo />
                    { /* <HtmlButton /> */}
                </Toolbar>
            </Editor>
        </EditorProvider>
    );
}


export function ExerciseDescription(props: { fieldName: string }) {

    const [field, meta, helpers] = useField(props.fieldName);

    return <>
        <div data-testid={'jodit-editor'}>
            <ExerciseEditor
                value={field.value}
                onChange={(newValue) => helpers.setValue(newValue.target.value)}
            />
        </div>
        {meta.touched
            && Boolean(meta.error)
            && <FormHelperText error>{meta.error}</FormHelperText>
        }
    </>;
}