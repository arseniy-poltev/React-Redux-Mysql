import {combineReducers} from 'redux';
import fuse from './fuse';

const createReducer = (asyncReducers) => combineReducers({
    fuse,
    ...asyncReducers
});

export default createReducer;
