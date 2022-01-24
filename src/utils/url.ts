import { AxiosRequestHeaders } from "axios";

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
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
    };

    const csrf_cookie = getCookie(DJANGO_CSRF_COOKIE);
    if (process.env.NODE_ENV === "production" && csrf_cookie != undefined) {
        out['X-CSRFToken'] = csrf_cookie;
    }

    return out;
}