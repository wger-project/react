import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCanContributeExercises } from "components/User/queries/contribute";
import { MIN_ACCOUNT_AGE } from "utils/consts";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export const NotEnoughRights = () => {
    const [t] = useTranslation();
    const contributeQuery = useCanContributeExercises();

    return (
        <Container maxWidth="md">
            <Typography variant={"h3"}>{t('exercises.notEnoughRightsHeader')}</Typography>
            <Box
                marginTop={4}
                padding={4}
                sx={{
                    width: "100%",
                    backgroundColor: "#ebebeb",
                    textAlign: "center",
                }}
            >
                <Typography mb={2}>{t('exercises.notEnoughRights', { days: MIN_ACCOUNT_AGE })}</Typography>

                {!contributeQuery.anonymous && !contributeQuery.emailVerified
                    &&
                    <Button variant="contained"
                            href={'/user/preferences'}
                            endIcon={<ArrowForwardIosIcon />}>
                        {t('preferences')}
                    </Button>
                }
            </Box>
        </Container>
    );
};
