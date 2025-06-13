async function fetchApartment(bearer : String, id: number) : Promise<string> {
    console.log("Sending req")
    const userUrl = (process.env.APT_URL || "http://localhost:3000") + "/apt/" + id
    const request = new Request(userUrl, {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + bearer 
        }
    })
    const aptID = (await (await fetch(request)).json()).appartment_id;
    return aptID;
}

export { fetchApartment };
