import i18n from 'i18next';
import * as yup from "yup";

const MIN_CHAR_NAME = 5;
const MAX_CHAR_NAME = 40;

const MIN_DESC_LENGTH = 120;
const MIN_DESC_WORDS = 15;

const MIN_NOTE_LENGTH = 15;


export const nameValidator = () => yup
    .string()
    .min(MIN_CHAR_NAME, i18n.t("forms.minLength", { count: MIN_CHAR_NAME }))
    .max(MAX_CHAR_NAME, i18n.t("forms.maxLength", { count: MAX_CHAR_NAME }))
    .required(i18n.t("forms.fieldRequired"));

export const alternativeNameValidator = () => yup
    .array()
    .ensure()
    .compact()
    .of(
        yup.object({
            id: yup.number().nullable(),
            alias: yup.string()
                .min(MIN_CHAR_NAME, i18n.t("forms.minLength", { count: MIN_CHAR_NAME }))
                .max(MAX_CHAR_NAME, i18n.t("forms.maxLength", { count: MAX_CHAR_NAME }))
                .required()
        })
    );

/** Words are tokens with at least one letter, so markdown list markers don't count */
const countWords = (text: string) => text.split(/\s+/).filter(token => /\p{L}/u.test(token)).length;

/**
 * Description of a translation. An existing description passed as ``unchanged`` stays
 * valid as long as it isn't edited, older entries may be shorter than the current limits.
 */
export const descriptionValidator = (unchanged?: string) => yup
    .string()
    .required(i18n.t("forms.fieldRequired"))
    .test(
        'minLength',
        i18n.t("forms.minLength", { count: MIN_DESC_LENGTH }),
        value => value === unchanged || (value ?? '').length >= MIN_DESC_LENGTH
    )
    .test(
        'minWords',
        i18n.t("forms.minWords", { count: MIN_DESC_WORDS }),
        value => value === unchanged || countWords(value ?? '') >= MIN_DESC_WORDS
    );

export const noteValidator = () => yup
    .array()
    .ensure()
    .compact()
    .of(
        yup
            .string()
            .min(MIN_NOTE_LENGTH, i18n.t("forms.minLength", { count: MIN_NOTE_LENGTH }))
    );

export const authorValidator = () => yup
    .string()
    .trim()
    .required(i18n.t("forms.fieldRequired"));

export const categoryValidator = () => yup
    .number()
    .required(i18n.t("forms.fieldRequired"));