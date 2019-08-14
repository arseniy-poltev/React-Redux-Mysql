import * as Actions from '../actions';
import _ from "../../../../../@lodash";
import {REHYDRATE} from "redux-persist/es/constants";

const initialState = {
    entities: {},
    searchText: '',
    selectedActivityIds: [],
    routeParams: {},
    contactDialog: {
        props: {
            open: false
        },
        data: null
    }
};

const activityReducer = function (state = initialState, action) {
    switch (action.type) {
        case Actions.GET_ACTIVITY_DATA: {
            return {
                ...state,
                entities: _.keyBy(action.payload, 'id'),
                routeParams: action.routeParams
            };
        }
        case Actions.OPEN_VIEW_CARD_DETAIL_DIALOG: {
            return {
                ...state,
                contactDialog: {
                    props: {
                        open: true
                    },
                    data: action.payload
                }
            };
        }
        case Actions.CLOSE_VIEW_CARD_DETAIL_DIALOG: {
            return {
                ...state,
                contactDialog: {
                    props: {
                        open: false
                    },
                    data: null
                }
            };
        }
        case Actions.SET_SEARCH_TEXT: {
            return {
                ...state,
                searchText: action.searchText
            };
        }
        case Actions.TOGGLE_IN_SELECTED_ACTIVITIES: {

            const cardId = action.cardId;
            let selectedActivityIds = [...state.selectedActivityIds];

            if (selectedActivityIds.find(id => id === cardId) !== undefined) {
                selectedActivityIds = selectedActivityIds.filter(id => id !== cardId);
            }
            else {
                selectedActivityIds = [...selectedActivityIds, cardId];
            }

            return {
                ...state,
                selectedActivityIds: selectedActivityIds
            };
        }
        case Actions.SELECT_ALL_ACTIVITIES: {
            const arr = Object.keys(state.entities).map(k => state.entities[k]);

            const selectedActivityIds = arr.map(card => card.id);

            return {
                ...state,
                selectedActivityIds: selectedActivityIds
            };
        }
        case Actions.DESELECT_ALL_ACTIVITIES: {
            return {
                ...state,
                selectedActivityIds: []
            };
        }
        case REHYDRATE:
            return action.payload && action.payload.activities ? action.payload.activities : {...state};
        default:
            return {...state};
    }

};

export default activityReducer;