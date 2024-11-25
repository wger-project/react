import { AxiosRequestConfig } from "axios";
import { IS_PROD, VITE_API_KEY, VITE_API_SERVER } from "config";
import slug from "slug";

interface makeUrlInterface {
    id?: number,
    server?: string,
    objectMethod?: string,
    query?: object,
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
            if (params.query.hasOwnProperty(key)) {
                // @ts-ignore
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
    ROUTINE_PDF_TABLE,
    ROUTINE_PDF_LOGS,
    ROUTINE_COPY,
    ROUTINE_ADD_LOG,
    ROUTINE_EDIT_LOG,
    ROUTINE_DELETE_LOG,

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

    language = language || 'en-us';

    // If the name is in the form of "en-US", remove the country code since
    // our django app can't work with that at the moment.
    const langShort = language.split('-')[0];

    switch (link) {
        // Workout routines
        case WgerLink.ROUTINE_OVERVIEW:
            return `/${langShort}/routine/overview`;
        case WgerLink.ROUTINE_DETAIL:
            return `/${langShort}/routine/${params!.id}/view`;
        case WgerLink.ROUTINE_DETAIL_TABLE:
            return `/${langShort}/routine/${params!.id}/table`;
        case WgerLink.ROUTINE_EDIT:
            return `/${langShort}/routine/${params!.id}/edit`;
        case WgerLink.ROUTINE_EDIT_PROGRESSION:
            return `/${langShort}/routine/${params!.id}/edit/progression/${params!.id2}`;
        case WgerLink.ROUTINE_ADD:
            return `/${langShort}/routine/add`;
        case WgerLink.ROUTINE_COPY:
            return `/${langShort}/routine/${params!.id}/copy`;
        case WgerLink.ROUTINE_PDF_TABLE:
            return `/${langShort}/routine/${params!.id}/pdf/table`;
        case WgerLink.ROUTINE_PDF_LOGS:
            return `/${langShort}/routine/${params!.id}/pdf/log`;
        case WgerLink.ROUTINE_LOGS_OVERVIEW:
            return `/${langShort}/routine/log/${params!.id}/view`;
        case WgerLink.ROUTINE_ADD_LOG:
            return `/${langShort}/routine/${params!.id}/day/${params!.id2}/add-logs`;
        case WgerLink.ROUTINE_EDIT_LOG:
            return `/${langShort}/routine/log/${params!.id}/edit`;
        case WgerLink.ROUTINE_DELETE_LOG:
            return `/${langShort}/routine/log/${params!.id}/delete`;
        case WgerLink.CALENDAR:
            return `/${langShort}/routine/calendar`;

        // Exercises
        case WgerLink.EXERCISE_CONTRIBUTE:
            return `/${langShort}/exercise/contribute`;

        case WgerLink.EXERCISE_DETAIL:
            if (params!.slug) {
                return `/${langShort}/exercise/${params!.id}/view-base/${slug(params!.slug)}`;
            } else {
                return `/${langShort}/exercise/${params!.id}/view-base`;
            }

        case WgerLink.EXERCISE_OVERVIEW:
            return `/${langShort}/exercise/overview`;

        // Weight
        case WgerLink.WEIGHT_OVERVIEW:
            return `/${langShort}/weight/overview`;
        case WgerLink.WEIGHT_ADD:
            return `/${langShort}/weight/add`;

        // Measurements
        case WgerLink.MEASUREMENT_OVERVIEW:
            return `/${langShort}/measurement/overview`;
        case WgerLink.MEASUREMENT_DETAIL:
            return `/${langShort}/measurement/category/${params!.id}`;

        // Nutrition
        case WgerLink.NUTRITION_OVERVIEW:
            return `/${langShort}/nutrition/overview`;
        case WgerLink.NUTRITION_DETAIL:
            return `/${langShort}/nutrition/${params!.id}/view`;
        case WgerLink.NUTRITION_DIARY:
            return `/${langShort}/nutrition/${params!.id}/${params!.date}`;
        case WgerLink.NUTRITION_PLAN_PDF:
            return `/${langShort}/nutrition/${params!.id}/pdf`;
        case WgerLink.NUTRITION_PLAN_COPY:
            return `/${langShort}/nutrition/${params!.id}/copy`;

        case WgerLink.INGREDIENT_DETAIL:
            return `/${langShort}/nutrition/ingredient/${params!.id}/view`;

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
 * util function that generates the needed headers
 *
 * Only during production when the script is embedded in the django application
 * do we need to add the CSRF token to the headers
 */
export function makeHeader(token?: string) {
    token = token || VITE_API_KEY;
    const DJANGO_CSRF_COOKIE = 'csrftoken';

    let out: AxiosRequestConfig['headers'] = {};
    out['Content-Type'] = 'application/json';

    if (token) {
        out['Authorization'] = `Token ${token}`;
    }

    const csrfCookie = getCookie(DJANGO_CSRF_COOKIE);
    // eslint-disable-next-line eqeqeq
    if (IS_PROD && csrfCookie != undefined) {
        out['X-CSRFToken'] = csrfCookie;
    }

    return out;
}

