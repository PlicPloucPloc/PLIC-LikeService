async function getUser(bearer : String) : Promise<string> {
    const userUrl = (process.env.USER_URL || "http://localhost:3000") + "/user"
    const request = new Request(userUrl, {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + bearer 
        }
    })
    return (await (await fetch(request)).json()).id;
}

export { getUser };
