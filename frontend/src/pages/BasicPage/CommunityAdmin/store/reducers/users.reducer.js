import * as Actions from '../actions';
import _ from '../../../../../@lodash';

const initialState = {
    entities: [],
    searchText: '',
    selectedContactIds: [],
    routeParams: {},
    contactDialog: {
        props: {
            open: false
        },
        data: null
    }
};

const usersReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.GET_CONTACTS: {
            return {
                ...state,
                entities: _.keyBy(action.payload, 'id'),
                routeParams: action.routeParams
            };
        }
        case Actions.SET_SEARCH_TEXT: {
            return {
                ...state,
                searchText: action.searchText
            };
        }
        case Actions.TOGGLE_IN_SELECTED_CONTACTS: {

            const contactId = action.contactId;

            let selectedContactIds = [...state.selectedContactIds];

            if (selectedContactIds.find(id => id === contactId) !== undefined) {
                selectedContactIds = selectedContactIds.filter(id => id !== contactId);
            } else {
                selectedContactIds = [...selectedContactIds, contactId];
            }

            return {
                ...state,
                selectedContactIds: selectedContactIds
            };
        }
        case Actions.SELECT_ALL_CONTACTS: {
            const arr = Object.keys(state.entities).map(k => state.entities[k]);

            const selectedContactIds = arr.map(contact => contact.id);

            return {
                ...state,
                selectedContactIds: selectedContactIds
            };
        }
        case Actions.DESELECT_ALL_CONTACTS: {
            return {
                ...state,
                selectedContactIds: []
            };
        }

        default: {
            return {...state};
        }
    }
};

export default usersReducer;
