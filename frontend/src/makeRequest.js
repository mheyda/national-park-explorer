
const baseUrl = 'http://127.0.0.1:8000/';

const makeRequest = async (options) => {
    const { urlExtension, method, body} = options;
    let tokens = localStorage.getItem('tokens') ? JSON.parse(localStorage.getItem('tokens')) : {access: null, refresh: null}

    // Refresh tokens first
    const refresh = await fetch(baseUrl + 'token/refresh/', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Authorization': `JWT ${tokens.access}`,
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(tokens),
    });
    
    if (refresh.ok) {
        const newTokens = await refresh.json();
        localStorage.setItem('tokens', JSON.stringify(newTokens));
        console.log("New Tokens")
        console.log(newTokens)
        tokens = newTokens;
    } else {
        localStorage.setItem('tokens', JSON.stringify({access: null, refresh: null}))
    }
    console.log("Access token: " + tokens.access)

    const response = await fetch((baseUrl + urlExtension), {
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Authorization': JSON.parse(localStorage.getItem('tokens')).access ? `JWT ${JSON.parse(localStorage.getItem('tokens')).access}` : null,
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: body ? JSON.stringify(body) : null,
    });

    const json = await response.json();

    if (response.ok) {
        return {
            data: json,
            error: false
        };
    }

    console.log(json)
    return {
        data: json,
        error: true
    }

}

export default makeRequest;