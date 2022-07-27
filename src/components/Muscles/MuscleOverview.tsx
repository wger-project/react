import React from "react";
import { Muscle } from "components/Exercises/models/muscle";
import { PUBLIC_URL } from "utils/url";

type OverviewCardProps = {
    primaryMuscles: Muscle[];
    secondaryMuscles: Muscle[];
    isFront: boolean;
};

export const MuscleOverview = ({ primaryMuscles, secondaryMuscles, isFront }: OverviewCardProps) => {
    const backgroundStyle = [];

    backgroundStyle.push(
        ...primaryMuscles
            .filter(m => m.isFront === isFront)
            .map(m => `/muscles/main/muscle-${m.id}.svg`)
    );
    backgroundStyle.push(
        ...secondaryMuscles
            .filter(m => m.isFront === isFront)
            .map(m => `/muscles/secondary/muscle-${m.id}.svg`)
    );
    backgroundStyle.push(isFront ? "/muscles/muscular_system_front.svg" : "/muscles/muscular_system_back.svg");
    const backgroundUrl = backgroundStyle.map(url => `url(${PUBLIC_URL}${url})`).join(", ");

    return (
        <div
            style={{
                height: "400px",
                width: "200px",
                backgroundImage: backgroundUrl,
                backgroundRepeat: "no-repeat"
            }}>
        </div>
    );
};
