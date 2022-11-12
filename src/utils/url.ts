import { AxiosRequestHeaders } from "axios";
import slug from "slug";

interface makeUrlInterface {
    id?: number,
    server?: string,
    query?: object,
}


/*
 * util function that generates a url string from a base url and a query object
 */
export function makeUrl(path: string, params?: makeUrlInterface) {
    params = params || {};

    // Base data
    const serverUrl = params.server || process.env.REACT_APP_API_SERVER;
    const pathlist = [serverUrl, 'api', 'v2', path];

    // Detail view
    if (params.id) {
        pathlist.push(params.id.toString());
    }
    pathlist.push('');

    // Query parameters
    if (params.query) {
        const querylist = [];
        for (const key in params.query) {
            if (params.query.hasOwnProperty(key)) {
                // @ts-ignore
                querylist.push(`${encodeURIComponent(key)}=${encodeURIComponent(params.query[key])}`);
            }
        }
        pathlist.pop();
        pathlist.push(`?${querylist.join('&')}`);
    }

    return pathlist.join('/');
}


export enum WgerLink {
    DASHBOARD,

    EXERCISE_DETAIL,
    EXERCISE_OVERVIEW,
    EXERCISE_CONTRIBUTE,

    WEIGHT_OVERVIEW,
    WEIGHT_ADD
}

type ExerciseDetailUrlParams = { id: number, slug?: string };

type UrlParams = ExerciseDetailUrlParams;


/*
 * Util function that generates a clickable url
 *
 * These URLs need to be kept in sync with the ones used in django
 */
export function makeLink(link: WgerLink, language: string, params?: UrlParams): string {

    // If the name is in the form of "en-US", remove the country code since
    // our django app can't work with that at the moment.
    const shortName = language.split('-')[0];

    switch (link) {
        // Exercises
        case WgerLink.EXERCISE_CONTRIBUTE:
            return `/${shortName}/exercise/contribute`;

        case WgerLink.EXERCISE_DETAIL:
            if (params!.slug) {
                return `/${shortName}/exercise/${params!.id}/view-base/${slug(params!.slug)}`;
            } else {
                return `/${shortName}/exercise/${params!.id}/view-base`;
            }

        case WgerLink.EXERCISE_OVERVIEW:
            return `/${shortName}/exercise/overview`;

        // Weight
        case WgerLink.WEIGHT_OVERVIEW:
            return `/${shortName}/weight/overview`;

        case WgerLink.WEIGHT_ADD:
            return `/${shortName}/weight/add`;

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
export function makeHeader(token?: string): AxiosRequestHeaders {
    token = token || process.env.REACT_APP_API_KEY;
    const DJANGO_CSRF_COOKIE = 'csrftoken';

    let out: AxiosRequestHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        out['Authorization'] = `Token ${token}`;
    }

    const csrfCookie = getCookie(DJANGO_CSRF_COOKIE);
    // eslint-disable-next-line eqeqeq
    if (process.env.NODE_ENV === "production" && csrfCookie != undefined) {
        out['X-CSRFToken'] = csrfCookie;
    }

    return out;
}

export const PUBLIC_URL = process.env.NODE_ENV === "production" ? "/static/react" : process.env.PUBLIC_URL;
export const SERVER_URL = process.env.NODE_ENV === "production" ? "" : process.env.REACT_APP_API_SERVER;