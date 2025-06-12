import { HttpError } from "elysia-http-error";

async function getUser(bearer : String) : Promise<string> {
    const userUrl = (process.env.USER_URL || "http://localhost:3000") + "/user/id"
    const request = new Request(userUrl, {
        method: "get",
        headers: {
            "Content-Type": "text/html",
            Authorization: "Bearer " + bearer 
        }
    })
    const resp = await fetch(request);
    if (!resp){
        throw HttpError.Forbidden("User not found or acces denied")
    }
    const content = await resp.text();
    if (content === null) {
        throw HttpError.Forbidden("User not found or acces denied");
    }
    return content;
}

export { getUser };
