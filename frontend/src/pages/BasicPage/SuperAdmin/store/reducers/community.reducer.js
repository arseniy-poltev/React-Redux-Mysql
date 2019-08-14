import {REHYDRATE} from "redux-persist/es/constants";
import * as Actions from "../actions";
import _ from "../../../../../@lodash";

const initState = {
    entities: {},
    searchText: '',
    selectedCommunityIds: [],
    detailViewDialog: {
        type: 'new',
        props: {
            open: false
        },
        data: null
    }
};
const community = (state = initState, action) => {
    switch (action.type) {
        case Actions.GET_COMMUNITIES:
            return {
                ...state,
                entities: _.keyBy(action.payload, 'id'),
            };
        case Actions.SET_SEARCH_TEXT: {
            return {
                ...state,
                searchText: action.searchText
            };
        }
        case Actions.OPEN_VIEW_COMMUNITY_DETAIL_DIALOG: {
            return {
                ...state,
                detailViewDialog: {
                    type: 'edit',
                    props: {
                        open: true
                    },
                    data: action.payload
                }
            };
        }
        case Actions.OPEN_ADD_NEW_COMMUNITY_DIALOG: {
            return {
                ...state,
                detailViewDialog: {
                    type: 'new',
                    props: {
                        open: true
                    },
                    data: null
                }
            };
        }
        case Actions.CLOSE_VIEW_COMMUNITY_DETAIL_DIALOG: {
            return {
                ...state,
                entities: _.keyBy(Object.keys(state.entities).map(
                    communityId => state.detailViewDialog.data
                    && communityId === state.detailViewDialog.data.id
                        ? state.detailViewDialog.data
                        : state.entities[communityId]
                ), 'id'),
                detailViewDialog: {
                    type: 'edit',
                    props: {
                        open: false
                    },
                    data: null
                }
            };
        }
        case Actions.TOGGLE_IN_SELECTED_COMMUNITIES: {

            const communityId = action.communityId;
            let selectedCommunityIds = [...state.selectedCommunityIds];

            if (selectedCommunityIds.find(id => id === communityId) !== undefined) {
                selectedCommunityIds = selectedCommunityIds.filter(id => id !== communityId);
            }
            else {
                selectedCommunityIds = [...selectedCommunityIds, communityId];
            }

            return {
                ...state,
                selectedCommunityIds: selectedCommunityIds
            };
        }
        case Actions.SELECT_ALL_COMMUNITIES: {
            const arr = Object.keys(state.entities).map(k => state.entities[k]);

            const selectedCommunityIds = arr.map(community => community.id);

            return {
                ...state,
                selectedCommunityIds: selectedCommunityIds
            };
        }
        case Actions.DESELECT_ALL_COMMUNITIES: {
            return {
                ...state,
                selectedCommunityIds: []
            };
        }
        case REHYDRATE:
            return action.payload && action.payload.communities ? action.payload.communities : {...state};
        default:
            return {...state};
    }
};

export default community