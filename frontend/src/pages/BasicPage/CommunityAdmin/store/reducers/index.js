import {combineReducers} from 'redux';
import users from './users.reducer';
import activities from './activity.reducer';

const reducer = combineReducers({
    users,
    activities
});

export default reducer;
