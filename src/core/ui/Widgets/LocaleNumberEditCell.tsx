import { InputBase } from "@mui/material";
import { GridRenderEditCellParams, useGridApiContext } from "@mui/x-data-grid";
import { formatNumberInput, parseNumberLocale } from "@/core/lib/numbers";
import { useEffect, useRef, useState } from "react";

/**
 * Editor for a number column that reads the value in the page language. The
 * grid's own one is an <input type="number">, which leaves that to the browser.
 *
 * The cell keeps the typed text and hands the grid the parsed number: null
 * when empty, NaN when it is no number.
 */
export function LocaleNumberEditCell({ id, field, value, hasFocus, colDef }: GridRenderEditCellParams) {
    const apiRef = useGridApiContext();
    const inputRef = useRef<HTMLInputElement>(null);
    const [text, setText] = useState(() => formatNumberInput(typeof value === 'number' ? value : null));

    useEffect(() => {
        if (hasFocus) {
            inputRef.current?.focus();
        }
    }, [hasFocus]);

    return <InputBase
        fullWidth
        inputRef={inputRef}
        value={text}
        onChange={event => {
            const newText = event.target.value;
            setText(newText);
            apiRef.current.setEditCellValue({
                id,
                field,
                value: newText.trim() === '' ? null : parseNumberLocale(newText),
            }, event);
        }}
        slotProps={{ input: { inputMode: 'decimal', 'aria-label': colDef.headerName } }}
        sx={{ height: '100%', '& input': { px: 2, textAlign: 'right' } }}
    />;
}

export const renderLocaleNumberEditCell = (params: GridRenderEditCellParams) =>
    <LocaleNumberEditCell {...params} />;
