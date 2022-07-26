
const baseUrl = 'http://127.0.0.1:8000/';
let authorization = null;

export const makeRequest = async (options) => {
    const { urlExtension, method, body, authRequired} = options;

    if (authRequired) {
        await refreshTokens();
        authorization = localStorage.getItem('tokens') ? `JWT ${JSON.parse(localStorage.getItem('tokens')).access}` : null;
    }

    const response = await fetch((baseUrl + urlExtension), {
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Authorization': authorization,
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: body ? JSON.stringify(body) : null,
    });

    // Read response body. If it's not empty, parse the JSON from it. If I don't do this, it causes a problem when the server doesn't return anything.
    const text = await response.text();
    let json;
    text ? json = JSON.parse(text) : json = null;

    if (response.ok) {
        return {
            data: json,
            error: false
        };
    }

    return {
        data: json,
        error: true
    }

}

export const refreshTokens = async () => {
    const tokens = localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens')) : null

    try {
        const response = await fetch(baseUrl + 'token/refresh/', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Authorization': localStorage.getItem('tokens') ? `JWT ${JSON.parse(localStorage.getItem('tokens')).access}` : null,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(tokens),
        });

        if (response.ok) {
            const newTokens = await response.json();
            localStorage.setItem('tokens', JSON.stringify(newTokens));
            return true;
        }

        throw new Error(response.statusText);

    } catch (error) {
        console.log(error);
        return false;
    }
}
