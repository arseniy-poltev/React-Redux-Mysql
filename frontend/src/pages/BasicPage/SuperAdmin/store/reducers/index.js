import {combineReducers} from 'redux';
import communities from './community.reducer';

const reducer = combineReducers({
    communities,
});

export default reducer;
