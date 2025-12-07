import { AxiosRequestConfig } from "axios";
import { IS_PROD, VITE_API_KEY, VITE_API_SERVER } from "config";
import slug from "slug";

interface makeUrlInterface {
    id?: number,
    server?: string,
    objectMethod?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query?: { [key: string]: any },
}


/*
 * util function that generates a url string from a base url and a query object
 */
export function makeUrl(path: string, params?: makeUrlInterface) {
    params = params || {};

    // Base data
    const serverUrl = params.server || VITE_API_SERVER;
    const paths = [serverUrl, 'api', 'v2', path];

    // Detail view
    if (params.id) {
        paths.push(params.id.toString());
    }

    // append object method to the path
    if (params.objectMethod) {
        paths.push(params.objectMethod);
    }

    paths.push('');

    // Query parameters
    if (params.query) {
        const queryList = [];
        for (const key in params.query) {
            if (Object.hasOwn(params.query, key)) {
                queryList.push(`${encodeURIComponent(key)}=${encodeURIComponent(params.query[key])}`);
            }
        }
        paths.pop();
        paths.push(`?${queryList.join('&')}`);
    }

    return paths.join('/');
}


export enum WgerLink {
    DASHBOARD,

    ROUTINE_OVERVIEW,
    ROUTINE_DETAIL,
    ROUTINE_EDIT,
    ROUTINE_DETAIL_TABLE,
    ROUTINE_EDIT_PROGRESSION,
    ROUTINE_ADD,
    ROUTINE_LOGS_OVERVIEW,
    ROUTINE_STATS_OVERVIEW,
    ROUTINE_PDF_TABLE,
    ROUTINE_PDF_LOGS,
    ROUTINE_ICAL,
    ROUTINE_COPY,
    ROUTINE_ADD_LOG,

    TEMPLATE_DETAIL,
    PRIVATE_TEMPLATE_OVERVIEW,
    PUBLIC_TEMPLATE_OVERVIEW,

    EXERCISE_DETAIL,
    EXERCISE_OVERVIEW,
    EXERCISE_CONTRIBUTE,

    WEIGHT_OVERVIEW,
    WEIGHT_ADD,

    MEASUREMENT_OVERVIEW,
    MEASUREMENT_DETAIL,

    NUTRITION_OVERVIEW,
    NUTRITION_DETAIL,
    NUTRITION_PLAN_PDF,
    NUTRITION_PLAN_COPY,
    NUTRITION_DIARY,

    INGREDIENT_DETAIL,

    CALENDAR
}

type UrlParams = { id: number, id2?: number, slug?: string, date?: string };


/*
 * Util function that generates a clickable url
 *
 * These URLs need to be kept in sync with the ones used in django
 */
export function makeLink(link: WgerLink, language?: string, params?: UrlParams): string {

    language = language?.toLowerCase() || 'en';

    switch (link) {
        // Workout routines
        case WgerLink.ROUTINE_OVERVIEW:
            return `/${language}/routine/overview`;
        case WgerLink.ROUTINE_DETAIL:
            return `/${language}/routine/${params!.id}/view`;
        case WgerLink.ROUTINE_DETAIL_TABLE:
            return `/${language}/routine/${params!.id}/table`;
        case WgerLink.ROUTINE_EDIT:
            return `/${language}/routine/${params!.id}/edit`;
        case WgerLink.ROUTINE_EDIT_PROGRESSION:
            return `/${language}/routine/${params!.id}/edit/progression/${params!.id2}`;
        case WgerLink.ROUTINE_ADD:
            return `/${language}/routine/add`;
        case WgerLink.ROUTINE_COPY:
            return `/${language}/routine/${params!.id}/copy`;
        case WgerLink.ROUTINE_PDF_TABLE:
            return `/${language}/routine/${params!.id}/pdf/table`;
        case WgerLink.ROUTINE_PDF_LOGS:
            return `/${language}/routine/${params!.id}/pdf/log`;
        case WgerLink.ROUTINE_ICAL:
            return `/${language}/routine/${params!.id}/ical`;
        case WgerLink.ROUTINE_LOGS_OVERVIEW:
            return `/${language}/routine/${params!.id}/logs`;
        case WgerLink.ROUTINE_STATS_OVERVIEW:
            return `/${language}/routine/${params!.id}/statistics`;
        case WgerLink.ROUTINE_ADD_LOG:
            return `/${language}/routine/${params!.id}/day/${params!.id2}/add-logs`;
        case WgerLink.CALENDAR:
            return `/${language}/routine/calendar`;
        // Templates
        case WgerLink.TEMPLATE_DETAIL:
            return `/${language}/routine/templates/${params!.id}/view`;
        case WgerLink.PRIVATE_TEMPLATE_OVERVIEW:
            return `/${language}/routine/templates/overview/private`;
        case WgerLink.PUBLIC_TEMPLATE_OVERVIEW:
            return `/${language}/routine/templates/overview/public`;

        // Exercises
        case WgerLink.EXERCISE_CONTRIBUTE:
            return `/${language}/exercise/contribute`;

        case WgerLink.EXERCISE_DETAIL:
            if (params!.slug) {
                return `/${language}/exercise/${params!.id}/view/${slug(params!.slug)}`;
            } else {
                return `/${language}/exercise/${params!.id}/view`;
            }

        case WgerLink.EXERCISE_OVERVIEW:
            return `/${language}/exercise/overview`;

        // Weight
        case WgerLink.WEIGHT_OVERVIEW:
            return `/${language}/weight/overview`;
        case WgerLink.WEIGHT_ADD:
            return `/${language}/weight/add`;

        // Measurements
        case WgerLink.MEASUREMENT_OVERVIEW:
            return `/${language}/measurement/overview`;
        case WgerLink.MEASUREMENT_DETAIL:
            return `/${language}/measurement/category/${params!.id}`;

        // Nutrition
        case WgerLink.NUTRITION_OVERVIEW:
            return `/${language}/nutrition/overview`;
        case WgerLink.NUTRITION_DETAIL:
            return `/${language}/nutrition/${params!.id}/view`;
        case WgerLink.NUTRITION_DIARY:
            return `/${language}/nutrition/${params!.id}/${params!.date}`;
        case WgerLink.NUTRITION_PLAN_PDF:
            return `/${language}/nutrition/${params!.id}/pdf`;
        case WgerLink.NUTRITION_PLAN_COPY:
            return `/${language}/nutrition/${params!.id}/copy`;

        case WgerLink.INGREDIENT_DETAIL:
            return `/${language}/nutrition/ingredient/${params!.id}/view`;

        // Dashboard
        case WgerLink.DASHBOARD:
        default:
            return "/";
    }
}

/*
 * Read cookie from browser
 *
 * from https://docs.djangoproject.com/en/3.2/ref/csrf/#ajax
 */
function getCookie(name: string) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/*
 * util function that generates the necessary headers
 *
 * Only during production when the script is embedded in the django application
 * do we need to add the CSRF token to the headers
 */
export function makeHeader(token?: string) {
    token = token || VITE_API_KEY;
    const DJANGO_CSRF_COOKIE = 'csrftoken';

    const out: AxiosRequestConfig['headers'] = {};
    out['Content-Type'] = 'application/json';
    out['Accept-Language'] = getAcceptLanguage();
    if (token) {
        out['Authorization'] = `Token ${token}`;
    }

    const csrfCookie = getCookie(DJANGO_CSRF_COOKIE);
    if (IS_PROD && csrfCookie != undefined) {
        out['X-CSRFToken'] = csrfCookie;
    }
    return out;
}

export function getAcceptLanguage():string{
const languages = navigator.languages || []; // get language preference from user's browser settings
if (languages.length === 0) {
    return 'en-US,en;';  //fallback 
  }

return languages.map((language,_)=>{
    return language;
}).join(',');
}