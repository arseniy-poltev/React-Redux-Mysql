import activities from './activity.reducer';
import {combineReducers} from 'redux';

const reducer = combineReducers({
    activities,
});

export default reducer;
