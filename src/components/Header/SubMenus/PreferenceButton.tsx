import { IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import { Settings } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";

export const PreferenceButton = () => {
    const { i18n } = useTranslation();

    return (
        <IconButton
            color="inherit"
            component={Link}
            to={makeLink(WgerLink.USER_PREFERENCES, i18n.language)}
            sx={{ mr: 2 }}
        >
            <Settings />
        </IconButton>
    );
};
