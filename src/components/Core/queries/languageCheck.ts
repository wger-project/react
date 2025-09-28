import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { checkLanguage } from "services";
import { LanguageCheckInput } from "services/languageCheck";


/*
 * Custom hook to check if an input string is in a particular language.
 * Either languageId or languageCode must be provided in the input.
 */
export function useLanguageCheckQuery() {
    return useMutation({
        mutationFn: async (data: LanguageCheckInput) => {
            try {
                const result = await checkLanguage(data);
                return { success: true, data: result };
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError;
                    // Bei 400 Fehler, geben wir die Fehlerdaten zurück anstatt den Fehler zu werfen
                    if (axiosError.response?.status === 400) {
                        return axiosError.response.data;
                    }
                }
                // Bei anderen Fehlern werfen wir den Fehler erneut
                throw error;
            }
        },
    });
}

