export const GET_ACTIVITY_DATA = '[COMMUNITY ADMIN] GET ACTIVITY DATA';
export const OPEN_VIEW_CARD_DETAIL_DIALOG = '[COMMUNITY ADMIN] OPEN VIEW CARD DETAIL DIALOG';
export const CLOSE_VIEW_CARD_DETAIL_DIALOG = '[COMMUNITY ADMIN] CLOSE EDIT CONTACT DIALOG';


export const TOGGLE_IN_SELECTED_ACTIVITIES = '[COMMUNITY ADMIN] TOGGLE IN SELECTED ACTIVITIES';
export const SELECT_ALL_ACTIVITIES = '[COMMUNITY ADMIN] SELECT ALL ACTIVITIES';
export const DESELECT_ALL_ACTIVITIES = '[COMMUNITY ADMIN] DESELECT ALL ACTIVITIES';
export const REMOVE_ACTIVITIES = '[COMMUNITY ADMIN] REMOVE ACTIVITIES';

export function getActivityData(activities, routeParams) {
    return {
        type: GET_ACTIVITY_DATA,
        payload: activities,
        routeParams
    }
}

export function openCardDetailDialog(data) {
    return {
        type: OPEN_VIEW_CARD_DETAIL_DIALOG,
        payload: data
    }
}

export function closeCardDetailDialog() {
    return {
        type: CLOSE_VIEW_CARD_DETAIL_DIALOG
    }
}

export function removeCards(cardIdsToRemove) {
    return (dispatch, getState) => {

        let activityData = getState().CommunityAdminStates.activities.entities;
        const {routeParams} = getState().CommunityAdminStates.users;

        const allActivityIds = Object.keys(activityData).map(idStr => Number(idStr));
        cardIdsToRemove.map(activityId =>
            allActivityIds.includes(activityId) && allActivityIds.splice(allActivityIds.indexOf(activityId), 1)
        );
        return Promise.all([
            dispatch({
                type: REMOVE_ACTIVITIES
            }),
            dispatch({
                type: DESELECT_ALL_ACTIVITIES
            })
        ]).then(() => dispatch(getActivityData(allActivityIds.map(activityId => activityData[activityId]), routeParams)))
    };
}
export function toggleInSelectedActivities(cardId) {
    return {
        type: TOGGLE_IN_SELECTED_ACTIVITIES,
        cardId
    }
}

export function selectAllActivities() {
    return {
        type: SELECT_ALL_ACTIVITIES
    }
}

export function deSelectAllActivities() {
    return {
        type: DESELECT_ALL_ACTIVITIES
    }
}
