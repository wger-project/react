import * as yup from "yup";

export const nameValidator = (t: Function) => yup
    .string()
    .min(5, t("forms.valueTooShort"))
    .max(40, t("forms.valueTooLong"))
    .required(t("forms.fieldRequired"));

export const alternativeNameValidator = (t: Function) => yup
    .string()
    .min(5, t("forms.valueTooShort"))
    .max(40, t("forms.valueTooLong"));

export const descriptionValidator = (t: Function) => yup
    .string()
    .min(40, t("forms.valueTooShort"))
    .required(t("forms.fieldRequired"));