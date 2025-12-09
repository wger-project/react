// components/Fasting/FastingTimerCard.tsx

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

type FastType = "16_8" | "18_6" | "20_4" | "omad" | "custom";

interface FastTypeOption {
    value: FastType;
    label: string;
    durationHours: number | null; // null for custom
}

const FAST_TYPE_OPTIONS: FastTypeOption[] = [
    { value: "16_8", label: "16:8 (16 hour fast)", durationHours: 16 },
    { value: "18_6", label: "18:6 (18 hour fast)", durationHours: 18 },
    { value: "20_4", label: "20:4 (20 hour fast)", durationHours: 20 },
    { value: "omad", label: "OMAD (~23 hour fast)", durationHours: 23 },
    { value: "custom", label: "Custom duration", durationHours: null },
];

const pad = (n: number) => n.toString().padStart(2, "0");

const toLocalInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatTime = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const formatDateTime = (date: Date | null) => {
    if (!date) return "-";
    return date.toLocaleString();
};

export const FastingTimerCard: React.FC = () => {
    const [isFasting, setIsFasting] = useState(false);

    // Start date/time input string (used by <input type="datetime-local" />)
    const [startInputValue, setStartInputValue] = useState<string>(
        toLocalInputValue(new Date())
    );

    // Currently selected fast type in the selector
    const [selectedFastType, setSelectedFastType] = useState<FastType>("16_8");

    // If custom fast is chosen, hours user types in
    const [customDurationHours, setCustomDurationHours] = useState<number>(16);

    // Active fast info once we hit "Start Fast"
    const [activeFastType, setActiveFastType] = useState<FastType | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);

    // For live timer updates
    const [now, setNow] = useState<Date>(new Date());

    useEffect(() => {
        if (!isFasting) return;

        const id = window.setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => window.clearInterval(id);
    }, [isFasting]);

    const handleFastTypeChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value as FastType;
        setSelectedFastType(value);
    };

    const getSelectedDurationHours = (): number | null => {
        const option = FAST_TYPE_OPTIONS.find(
            (opt) => opt.value === selectedFastType
        );
        if (!option) return null;

        if (option.durationHours !== null) {
            return option.durationHours;
        }
        // Custom
        return customDurationHours > 0 ? customDurationHours : null;
    };

    const handleStartFast = () => {
        const parsed = new Date(startInputValue);
        if (Number.isNaN(parsed.getTime())) {
            alert("Please enter a valid start date & time.");
            return;
        }

        const durationHours = getSelectedDurationHours();
        if (durationHours == null) {
            alert("Please enter a valid fast duration (in hours).");
            return;
        }

        const projectedEnd = new Date(
            parsed.getTime() + durationHours * 60 * 60 * 1000
        );

        setStartTime(parsed);
        setEndTime(projectedEnd);
        setActiveFastType(selectedFastType);
        setIsFasting(true);
        setNow(new Date());
    };

    const handleEndFast = () => {
        setIsFasting(false);
        setActiveFastType(null);
        setStartTime(null);
        setEndTime(null);
    };

    const elapsedMs =
        isFasting && startTime ? now.getTime() - startTime.getTime() : 0;

    const statusText = isFasting
        ? "Currently fasting"
        : "Not fasting right now";

    const activeFastLabel =
        activeFastType &&
        FAST_TYPE_OPTIONS.find((opt) => opt.value === activeFastType)?.label;

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                p: 2,
            }}
        >
            {/* Header */}
            <Typography variant="h6" sx={{ mb: 0.5 }}>
                Fasting
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {statusText}
            </Typography>

            {/* Timer display */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h3"
                    sx={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {formatTime(elapsedMs)}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                >
                    {isFasting
                        ? "Time since start"
                        : 'Press "Start Fast" to begin a new fasting window.'}
                </Typography>
            </Box>

            {/* Controls */}
            <Stack spacing={2} sx={{ mt: 2 }}>
                {/* Start date/time input */}
                <TextField
                    label="Start date & time"
                    type="datetime-local"
                    value={startInputValue}
                    onChange={(e) => setStartInputValue(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                />

                {/* Fast type selector */}
                <FormControl fullWidth size="small">
                    <InputLabel id="fast-type-label">Fast type</InputLabel>
                    <Select
                        labelId="fast-type-label"
                        label="Fast type"
                        value={selectedFastType}
                        onChange={handleFastTypeChange}
                    >
                        {FAST_TYPE_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Custom duration input (only when custom selected) */}
                {selectedFastType === "custom" && (
                    <TextField
                        label="Custom duration (hours)"
                        type="number"
                        size="small"
                        value={customDurationHours}
                        onChange={(e) =>
                            setCustomDurationHours(
                                Number(e.target.value) || 0
                            )
                        }
                        inputProps={{ min: 1 }}
                        fullWidth
                    />
                )}

                {/* Active fast summary */}
                {isFasting && (
                    <Box sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                        <div>
                            <strong>Type:</strong>{" "}
                            {activeFastLabel ?? "Unknown"}
                        </div>
                        <div>
                            <strong>Started:</strong>{" "}
                            {formatDateTime(startTime)}
                        </div>
                        <div>
                            <strong>Projected end:</strong>{" "}
                            {formatDateTime(endTime)}
                        </div>
                    </Box>
                )}

                {/* Action buttons */}
                <Stack direction="row" spacing={1} justifyContent="center">
                    {!isFasting ? (
                        <Button
                            variant="contained"
                            onClick={handleStartFast}
                            fullWidth
                        >
                            Start Fast
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleEndFast}
                            fullWidth
                        >
                            End Fast
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};
