export const SET_SEARCH_TEXT = '[SUPER ADMIN] SET SEARCH TEXT';

export const GET_COMMUNITIES = '[SUPER ADMIN] GET COMMUNITIES';

export const OPEN_VIEW_COMMUNITY_DETAIL_DIALOG = '[SUPER ADMIN] OPEN VIEW COMMUNITY DETAIL DIALOG';
export const OPEN_ADD_NEW_COMMUNITY_DIALOG = '[SUPER ADMIN] ADD NEW COMMUNITY DIALOG';
export const CLOSE_VIEW_COMMUNITY_DETAIL_DIALOG = '[SUPER ADMIN] CLOSE EDIT COMMUNITY DIALOG';


export const TOGGLE_IN_SELECTED_COMMUNITIES = '[SUPER ADMIN] TOGGLE IN SELECTED COMMUNITIES';
export const SELECT_ALL_COMMUNITIES = '[SUPER ADMIN] SELECT ALL COMMUNITIES';
export const DESELECT_ALL_COMMUNITIES = '[SUPER ADMIN] DESELECT ALL COMMUNITIES';

export const ADD_COMMUNITY = '[SUPER ADMIN] ADD COMMUNITY';
export const REMOVE_COMMUNITIES = '[SUPER ADMIN] REMOVE COMMUNITIES';
export const ADD_ADMINS = '[SUPER ADMIN] ADD ADMINS';
export const REMOVE_ADMIN = '[SUPER ADMIN] REMOVE ADMIN';

export function getCommunities(allCommunities) {
    return {
        type: GET_COMMUNITIES,
        payload: allCommunities
    }
}

export function setSearchText(event) {
    return {
        type: SET_SEARCH_TEXT,
        searchText: event.target.value
    }
}

export function openCommunityDetailDialog(data) {
    return {
        type: OPEN_VIEW_COMMUNITY_DETAIL_DIALOG,
        payload: data
    }
}

export function openAddNewCommunityDialog() {
    return {
        type: OPEN_ADD_NEW_COMMUNITY_DIALOG,
    }
}

export function closeCommunityDetailDialog() {
    return {
        type: CLOSE_VIEW_COMMUNITY_DETAIL_DIALOG
    }
}

export function addNewCommunity(communityInfo) {
    return (dispatch, getState) => {

        let communityData = getState().SuperAdminStates.communities.entities;

        const allCommunityIds = Object.keys(communityData).map(idStr => Number(idStr));
        const arrCommunityData = allCommunityIds.map(communityId => communityData[communityId]);
        !allCommunityIds.includes(communityInfo.id) && arrCommunityData.push(communityInfo);
        return Promise.resolve(dispatch({
            type: ADD_COMMUNITY
        })).then(() => dispatch(getCommunities(arrCommunityData)))
    };
}

export function removeCommunities(communityIdsToRemove) {
    return (dispatch, getState) => {

        let communityData = getState().SuperAdminStates.communities.entities;

        const allCommunityIds = Object.keys(communityData).map(idStr => Number(idStr));
        communityIdsToRemove.map(communityId =>
            allCommunityIds.includes(communityId) && allCommunityIds.splice(allCommunityIds.indexOf(communityId), 1)
        );
        return Promise.all([
            dispatch({
                type: REMOVE_COMMUNITIES
            }),
            dispatch({
                type: DESELECT_ALL_COMMUNITIES
            })
        ]).then(() => dispatch(getCommunities(allCommunityIds.map(communityId => communityData[communityId]))))
    };
}

export function toggleInSelectedCommunities(communityId) {
    return {
        type: TOGGLE_IN_SELECTED_COMMUNITIES,
        communityId
    }
}

export function selectAllCommunities() {
    return {
        type: SELECT_ALL_COMMUNITIES
    }
}

export function deSelectAllCommunities() {
    return {
        type: DESELECT_ALL_COMMUNITIES
    }
}

export function removeAdmin(communityId, adminId) {
    return (dispatch, getState) => {
        let communityData = getState().SuperAdminStates.communities.entities;
        const allCommunityIds = Object.keys(communityData).map(idStr => Number(idStr));

        const adminsInfo = communityData[communityId].admins;
        adminsInfo.splice(adminsInfo.indexOf(adminsInfo.find(adminInfo => adminInfo.id === adminId)), 1);
        return Promise.all([
            dispatch({
                type: REMOVE_ADMIN
            }),
            dispatch({
                type: DESELECT_ALL_COMMUNITIES
            }),
            dispatch(openCommunityDetailDialog({
                ...communityData[communityId],
                admins: adminsInfo
            }))
        ]).then(() => dispatch(getCommunities(allCommunityIds.map(itemCommunityId => itemCommunityId === communityId
            ? {...communityData[itemCommunityId], admins: adminsInfo}
            : communityData[itemCommunityId]
        ))))
    }
}