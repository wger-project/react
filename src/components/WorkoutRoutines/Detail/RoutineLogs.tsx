import React from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Container, Stack } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { useRoutineLogQuery } from "components/WorkoutRoutines/queries";
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";


export const RoutineLogs = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const [t, i18n] = useTranslation();
    const logsQuery = useRoutineLogQuery(routineId);


    // TODO: remove this when we add the logic in react
    const navigateAddDay = () => window.location.href = makeLink(WgerLink.ROUTINE_ADD_DAY, i18n.language, { id: routineId });

    return (
        <>
            <Container maxWidth="lg">
                {
                    logsQuery.isLoading
                        ? <LoadingPlaceholder />
                        : <>
                            {/*<Typography variant={"h3"}>*/}
                            {/*    {routineQuery.data!.name !== '' ? routineQuery.data!.name : t('routines.routine')}*/}
                            {/*</Typography>*/}
                            <Stack spacing={2} sx={{ mt: 2 }}>
                                {logsQuery.data!.map((log) => (
                                    <p key={log.id}>{log.date.toDateString()}</p>
                                ))}
                            </Stack>
                            <Box textAlign='center' sx={{ mt: 4 }}>
                                <Button variant="outlined" onClick={navigateAddDay}>
                                    {t('routines.addDay')}
                                </Button>
                            </Box>
                        </>
                }
            </Container>
        </>
    );
};
