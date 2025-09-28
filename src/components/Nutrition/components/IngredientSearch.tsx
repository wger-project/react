import { Ingredient } from "components/Nutrition/models/Ingredient";
import { IngredientAutocompleter } from "components/Nutrition/widgets/IngredientAutcompleter";
import React from "react";
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";


/*
 * Ingredient autocompleter used to navigate the user to the ingredient
 * detail page from the overview
 */
export const IngredientSearch = () => {
    const { i18n } = useTranslation();

    const navigateToIngredient = (value: Ingredient | null) => {
        if (value !== null) {
            window.location.href = makeLink(WgerLink.INGREDIENT_DETAIL, i18n.language, { id: value.id });
        }
    };

    return <IngredientAutocompleter
        callback={navigateToIngredient}
    />;
};