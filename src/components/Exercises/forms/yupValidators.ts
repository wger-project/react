import i18n from 'i18next';
import * as yup from "yup";

const MIN_CHAR_NAME = 5;
const MAX_CHAR_NAME = 40;

const MIN_DESC_LENGTH = 40;

const MIN_NOTE_LENGTH = 15;


export const nameValidator = () => yup
    .string()
    .min(MIN_CHAR_NAME, i18n.t("forms.minLength", { 'chars': MIN_CHAR_NAME }))
    .max(MAX_CHAR_NAME, i18n.t("forms.maxLength", { 'chars': MAX_CHAR_NAME }))
    .required(i18n.t("forms.fieldRequired"));

export const alternativeNameValidator = () => yup
    .array()
    .ensure()
    .compact()
    .of(
        yup.object({
            id: yup.number().nullable(),
            alias: yup.string()
                .min(MIN_CHAR_NAME, i18n.t("forms.minLength", { 'chars': MIN_CHAR_NAME }))
                .max(MAX_CHAR_NAME, i18n.t("forms.maxLength", { 'chars': MAX_CHAR_NAME }))
                .required()
        })
    );

export const descriptionValidator = () => yup
    .string()
    .min(MIN_DESC_LENGTH, i18n.t("forms.minLength", { 'chars': MIN_DESC_LENGTH }))
    .required(i18n.t("forms.fieldRequired"));

export const noteValidator = () => yup
    .array()
    .ensure()
    .compact()
    .of(
        yup
            .string()
            .min(MIN_NOTE_LENGTH, i18n.t("forms.minLength", { 'chars': MIN_NOTE_LENGTH }))
    );

export const categoryValidator = () => yup
    .number()
    .required(i18n.t("forms.fieldRequired"));