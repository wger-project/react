import "i18next";
import { resources } from "i18n";

declare module "i18next" {
    
    // Extend CustomTypeOptions
    interface CustomTypeOptions {
        defaultNS: "common";
        resources: {
            common: typeof resources.en.common;
        };
    }
}