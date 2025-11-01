import { apartment_info } from "../models/apartment_info";
import { coordinates } from "../models/coordinates";

export async function fetchApartment(bearer: String, id: number): Promise<string> {
    console.log('Sending request for apartment');
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
    console.log('Sending request for apartment info');
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

export async function fetchApartmentCoordinates(bearer: string, id: number): Promise<coordinates> {
    console.log('Sending request for coordinates of apartment id: ', id);
    const userUrl = (process.env.APT_URL || 'http://localhost:3000') + '/coordinates?apartment_id=' + id;
    const request = new Request(userUrl, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + bearer,
        },
    });
    var response = await fetch(request);
    if (!response.ok) {
        throw new Error(`Error fetching apartment coordinates: ${response.statusText}`);
    }
    var coordinates = await response.json();
    console.log('Coordinates received for : ', coordinates);
    return coordinates;
}
