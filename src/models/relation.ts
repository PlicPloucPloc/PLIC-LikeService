class relation {
    type: relation_type;
    aptId: string;

    constructor(type: relation_type, aptId: string) {
        this.type = type;
        this.aptId = aptId;
    }
}

export { relation };
