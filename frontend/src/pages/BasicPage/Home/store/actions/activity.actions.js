export function GetAllActivities(res) {
    return {
        type: 'GetAllActivities',
        payload: res.sort((a, b) => {
            return b.id - a.id;
        })
    }
}
export function RemoveAllActivities() {
    return {
        type: 'RemoveAllActivities',
    }
}
export function AddCard(cardDetail) {
    return {
        type: 'AddCard',
        payload: cardDetail
    }
}

export function AddNewComment(cardDetail) {
    return {
        type: 'AddNewComment',
        cardDetail
    }
}
export function AddNewAccept(cardDetail) {
    return {
        type: 'AddNewAccept',
        cardDetail
    }
}