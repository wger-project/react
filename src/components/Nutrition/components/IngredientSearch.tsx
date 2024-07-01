import { IngredientAutocompleter } from "components/Nutrition/widgets/IngredientAutcompleter";
import React from "react";
import { useTranslation } from "react-i18next";
import { IngredientSearchResponse } from "services/responseType";
import { makeLink, WgerLink } from "utils/url";


/*
 * Ingredient autocompleter used to navigate the user to the ingredient
 * detail page from the overview
 */
export const IngredientSearch = () => {
    const [t, i18n] = useTranslation();

    const navigateToIngredient = (value: IngredientSearchResponse | null) => {
        if (value !== null) {
            window.location.href = makeLink(WgerLink.INGREDIENT_DETAIL, i18n.language, { id: value.data.id });
        }
    };

    return <IngredientAutocompleter
        callback={navigateToIngredient}
    />;
};