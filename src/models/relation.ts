import apartment_info from "./apartment_info";

class relation {
    type: string;
    apt: apartment_info;

    constructor(type: string, apt: apartment_info) {
        this.type = type;
        this.apt = apt;
    }
}

export { relation };
