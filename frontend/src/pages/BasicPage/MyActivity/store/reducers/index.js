import {combineReducers} from 'redux';
import myActivities from './myActivity.reducer';

const reducer = combineReducers({
    myActivities,
});

export default reducer;
