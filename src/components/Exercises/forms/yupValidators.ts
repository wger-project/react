import * as yup from "yup";

const MIN_CHAR_NAME = 5;
const MAX_CHAR_NAME = 40;


export const nameValidator = (t: Function) => yup
    .string()
    .min(MIN_CHAR_NAME, t("forms.valueTooShort"))
    .max(MAX_CHAR_NAME, t("forms.valueTooLong"))
    .required(t("forms.fieldRequired"));

export const alternativeNameValidator = (t: Function) => yup
    .array()
    .ensure()
    .compact()
    .of(
        yup
            .string()
            .min(MIN_CHAR_NAME, t("forms.valueTooShort"))
            .max(MAX_CHAR_NAME, t("forms.valueTooLong"))
    );

export const descriptionValidator = (t: Function) => yup
    .string()
    .min(40, t("forms.valueTooShort"))
    .required(t("forms.fieldRequired"));

export const noteValidator = (t: Function) => yup
    .array()
    .ensure()
    .compact()
    .of(
        yup
            .string()
            .min(15, t("forms.valueTooShort"))
    );

export const categoryValidator = (t: Function) => yup
    .number()
    .required(t("forms.fieldRequired"));