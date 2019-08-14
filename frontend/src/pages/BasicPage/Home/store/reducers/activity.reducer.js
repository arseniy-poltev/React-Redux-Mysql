import {REHYDRATE} from "redux-persist/es/constants";
import config from "../../../../../config";

const DEFAULT_COLUMNS = ['Asking/Offers', 'Announcements', 'Shared Stories', 'Emergency/Other'];
let initState = {
    all: [],
    columns: DEFAULT_COLUMNS.map((title, i) => ({
        id: i + 1,
        title,
        cardIds: []
    }))
};
const activities = (state = initState, action) => {
    switch (action.type) {
        case 'GetAllActivities':
            return {
                ...state,
                all: [
                    ...action.payload
                ],
                columns: initialColumns(action.payload)
            };
        case 'RemoveAllActivities':
            return {
                all: [],
                columns: DEFAULT_COLUMNS.map((title, i) => ({
                    id: i + 1,
                    title,
                    cardIds: []
                }))
            };
        case 'AddCard':
            return {
                ...state,
                all: [
                    action.payload,
                    ...state.all
                ],
                columns: state.columns.map(
                    (column, index) => action.payload.isEmergency ? (
                        column.id === config.columnType.EMERGENCY
                            ? {...column, cardIds: [action.payload.id, ...column.cardIds]}
                            : column
                    ) : (
                        column.id === getColumnTypeFromActivityType(action.payload.activityType)
                            ? {...column, cardIds: [action.payload.id, ...column.cardIds]}
                            : column
                    )
                )
            };
        case 'AddNewComment':
            const newCard = action.cardDetail;
            state.all.find(
                activity => activity.id === newCard.id
            ).comments = newCard.comments;
            return state;
        case 'AddNewAccept':
            let {id, accepts} = action.cardDetail;
            state.all.find(activity => activity.id === id).accepts = accepts;
            return state;
        case REHYDRATE:
            return action.payload && action.payload.activities ? action.payload.activities : {...state};
        default:
            return {
                ...state
            };
    }
};
const initialColumns = (initialCards) => DEFAULT_COLUMNS.map((title, i) => ({
    id: i + 1,
    title,
    cardIds: getCardIds(initialCards, i + 1)
}));
const getCardIds = (initialCards, columnType) => {
    if (initialCards.length === 0) {
        return []
    }
    switch (columnType) {
        case config.columnType.ASK_OFFER:
            return initialCards.filter(
                card => (card.activityType === config.activityType.ASK || card.activityType === config.activityType.OFFER) && !card.isEmergency
            ).map(card => card.id);
        case config.columnType.ANNOUNCE:
            return initialCards.filter(
                card => card.activityType === config.activityType.ANNOUNCE && !card.isEmergency
            ).map(card => card.id);
        case config.columnType.SHARED_STORIES:
            return initialCards.filter(
                card => card.activityType === config.activityType.SHARED_STORIES && !card.isEmergency
            ).map(card => card.id);
        case config.columnType.EMERGENCY:
            return initialCards.filter(
                card => card.isEmergency
            ).map(card => card.id);
        default:
            return []
    }
};
const getColumnTypeFromActivityType = (activityType) => {
    switch (activityType) {
        case config.activityType.ASK:
        case config.activityType.OFFER:
            return config.columnType.ASK_OFFER;
        case config.activityType.ANNOUNCE:
            return config.columnType.ANNOUNCE;
        case config.activityType.SHARED_STORIES:
            return config.columnType.SHARED_STORIES;
        default:
            return null
    }
};
export default activities