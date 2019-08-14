import {REHYDRATE} from "redux-persist/es/constants";

const initState = {
    myAccepts: [],
    myPosts: [],
    activeCard: {}
};
const myActivity = (state = initState, action) => {
    switch (action.type) {
        case 'SaveMyAccepts':
            return {
                ...state,
                myAccepts: action.payload,
            };
        case 'SaveMyPosts':
            return {
                ...state,
                myPosts: action.payload,
            };
        case 'UpdateMyActivityDetail':
            return {
                ...state,
                myPosts: state.myPosts.map(
                    activity => activity.id === action.payload.id ? action.payload : activity
                ),
            };
        case 'SetActiveCard':
            return {
                ...state,
                activeCard: action.payload
            };
        case REHYDRATE:
            return action.payload && action.payload.myActivities ? action.payload.myActivities : {...state};
        default:
            return {...state};
    }
};

export default myActivity