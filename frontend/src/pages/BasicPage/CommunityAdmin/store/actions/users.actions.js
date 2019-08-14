import config from '../../../../../config';
import _ from "../../../../../@lodash";

export const GET_CONTACTS = '[CONTACTS APP] GET CONTACTS';
export const SET_SEARCH_TEXT = '[CONTACTS APP] SET SEARCH TEXT';
export const TOGGLE_IN_SELECTED_CONTACTS = '[CONTACTS APP] TOGGLE IN SELECTED CONTACTS';
export const SELECT_ALL_CONTACTS = '[CONTACTS APP] SELECT ALL CONTACTS';
export const DESELECT_ALL_CONTACTS = '[CONTACTS APP] DESELECT ALL CONTACTS';
export const ADD_CONTACT = '[CONTACTS APP] ADD CONTACT';
export const REMOVE_CONTACTS = '[CONTACTS APP] REMOVE CONTACTS';
export const TOGGLE_STARRED_CONTACT = '[CONTACTS APP] TOGGLE STARRED CONTACT';

export function getContacts(userData, routeParams) {
    return {
        type: GET_CONTACTS,
        payload: userData,
        routeParams
    }
}

export function setSearchText(event) {
    return {
        type: SET_SEARCH_TEXT,
        searchText: event.target.value
    }
}

export function toggleInSelectedContacts(contactId) {
    return {
        type: TOGGLE_IN_SELECTED_CONTACTS,
        contactId
    }
}

export function selectAllContacts() {
    return {
        type: SELECT_ALL_CONTACTS
    }
}

export function deSelectAllContacts() {
    return {
        type: DESELECT_ALL_CONTACTS
    }
}

export function addNewUsers(newUsers) {
    return (dispatch, getState) => {

        const userData = getState().CommunityAdminStates.users.entities;
        const {routeParams} = getState().CommunityAdminStates.users;
        const newUsersObject = _.keyBy(newUsers, 'id');
        const result = Object.assign(userData, newUsersObject);
        return Promise.resolve(
            dispatch({
                type: ADD_CONTACT
            })
        ).then(() => dispatch(getContacts(Object.keys(result).map(userId => result[userId]), routeParams)))
    };
}

export function removeUsers(userIdsToRemove) {
    return (dispatch, getState) => {

        let userData = getState().CommunityAdminStates.users.entities;
        const {routeParams} = getState().CommunityAdminStates.users;

        const allUserIds = Object.keys(userData).map(idStr => Number(idStr));
        userIdsToRemove.map(userId =>
            allUserIds.includes(userId) && allUserIds.splice(allUserIds.indexOf(userId), 1)
        );
        return Promise.all([
            dispatch({
                type: REMOVE_CONTACTS
            }),
            dispatch({
                type: DESELECT_ALL_CONTACTS
            })
        ]).then(() => dispatch(getContacts(allUserIds.map(userId => userId && userData[userId]), routeParams)))
    };
}

export function approveRequestToJoin(userIds) {
    return (dispatch, getState) => {
        const userData = getState().CommunityAdminStates.users.entities;
        userIds.map(userIdToJoin => userData[userIdToJoin]['status'] = config.userJoinStatus.ACCEPTED);

        return Promise.all([
            dispatch({
                type: TOGGLE_STARRED_CONTACT
            }),

        ]).then(() => {
            dispatch({
                type: DESELECT_ALL_CONTACTS
            })
        })
    };
}
