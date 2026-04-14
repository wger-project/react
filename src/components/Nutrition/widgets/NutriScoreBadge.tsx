import { Box } from "@mui/material";
import { NUTRI_SCORES, NutriScoreValue } from "types";

const NUTRISCORE_COLORS: Record<NutriScoreValue, string> = {
    a: '#0d8949',
    b: '#72c72b',
    c: '#fbc606',
    d: '#f37115',
    e: '#ee301f',
};

type NutriScoreBadgeProps = {
    score: NutriScoreValue;
    size?: 'small' | 'medium' | 'large';
};

const SIZES = {
    small: { height: 20, activeHeight: 24, fontSize: 10, activeFontSize: 14, px: 3, activePx: 2 },
    medium: { height: 22, activeHeight: 28, fontSize: 12, activeFontSize: 16, px: 3, activePx: 3, },
    large: { height: 28, activeHeight: 36, fontSize: 15, activeFontSize: 20, px: 4, activePx: 4 },
};

export function NutriScoreBadge({ score, size = 'medium' }: NutriScoreBadgeProps) {
    const dim = SIZES[size];

    return (
        <Box sx={{ display: "inline-flex", alignItems: "center" }}>
            {NUTRI_SCORES.map((s, i) => {
                const isActive = s === score;
                const height = isActive ? dim.activeHeight : dim.height;
                const fontSize = isActive ? dim.activeFontSize : dim.fontSize;
                const isFirst = i === 0;
                const isLast = i === NUTRI_SCORES.length - 1;

                return (
                    <Box
                        key={s}
                        sx={{
                            height: height,
                            paddingX: `${isActive ? dim.activePx : dim.px}px`,
                            marginX: `${isActive ? dim.activePx : 0}px`,
                            borderRadius: isFirst
                                ? `${height / 2}px 0 0 ${height / 2}px`
                                : isLast
                                    ? `0 ${height / 2}px ${height / 2}px 0`
                                    : 0,
                            backgroundColor: NUTRISCORE_COLORS[s],
                            color: s === 'c' && !isActive ? '#000' : '#fff',
                            opacity: isActive ? 1 : 0.4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: fontSize,
                            fontWeight: 700,
                            lineHeight: 1,
                        }}
                    >
                        {s.toUpperCase()}
                    </Box>
                );
            })}
        </Box>
    );
}
