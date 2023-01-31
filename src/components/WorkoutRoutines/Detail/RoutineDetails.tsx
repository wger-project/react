import React from "react";
import { useParams } from "react-router-dom";
import { Container } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";


export const RoutineDetails = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;

    const routineQuery = useRoutineDetailQuery(routineId);

    return (
        <>
            <Container maxWidth="lg">
                {
                    routineQuery.isLoading
                        ? <LoadingPlaceholder />
                        : <p>{routineQuery.data!.name}</p>
                }
            </Container>
        </>
    );
};
