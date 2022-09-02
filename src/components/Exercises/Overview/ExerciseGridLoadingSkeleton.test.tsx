import React from "react";
import { render } from "@testing-library/react";
import { ExerciseGridSkeleton } from "components/Exercises/Overview/ExerciseGridLoadingSkeleton";

test('Renders without crashing', async () => {

    // Act
    render(<ExerciseGridSkeleton />);

});