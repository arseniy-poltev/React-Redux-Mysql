export function SaveMyPosts(myPosts) {
    return {
        type: 'SaveMyPosts',
        payload: myPosts.sort((a, b) => {
            return b.id - a.id;
        })
    }
}
export function SaveMyAccepts(myAccepts) {
    return {
        type: 'SaveMyAccepts',
        payload: myAccepts.sort((a, b) => {
            return b.id - a.id;
        })
    }
}
export function SetActiveCard(cardDetail) {
    return {
        type: 'SetActiveCard',
        payload: cardDetail
    }
}
export function UpdateMyActivityDetail(activityData) {
    return {
        type: 'UpdateMyActivityDetail',
        payload: activityData
    }
}