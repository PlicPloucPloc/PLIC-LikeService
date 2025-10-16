import { apartment_info } from "../models/apartment_info";

export async function fetchApartment(bearer: String, id: number): Promise<string> {
    console.log('Sending req');
    const userUrl = (process.env.APT_URL || 'http://localhost:3000') + '/' + id;
    const request = new Request(userUrl, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + bearer,
        },
    });
    const aptID = (await (await fetch(request)).json()).apartment_id;
    return aptID;
}

export async function fetchApartmentInfo(bearer: String, id: number): Promise<apartment_info> {
    console.log('Sending req');
    const userUrl = (process.env.APT_URL || 'http://localhost:3000') + '/' + id;
    const request = new Request(userUrl, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + bearer,
        },
    });
    const aptInfo = await (await fetch(request)).json();
    return aptInfo;
}
