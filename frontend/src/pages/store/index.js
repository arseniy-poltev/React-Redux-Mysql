import * as reduxModule from 'redux';
import {createStore, applyMiddleware, compose} from 'redux';
import {persistStore, persistReducer} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import thunk from 'redux-thunk';
// import {createLogger} from 'redux-logger';
import createReducer from './reducers';

reduxModule.__DO_NOT_USE__ActionTypes.REPLACE = '@@redux/INIT';
const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

// const logger = createLogger({});

const persistConfig = {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2,
};
const persistedReducer = persistReducer(persistConfig, createReducer());

const enhancer = composeEnhancers(
    // applyMiddleware(thunk, logger)
    applyMiddleware(thunk)
);

export const store = createStore(persistedReducer, enhancer);
export const persistor = persistStore(store);

store.asyncReducers = {};

export const injectReducer = (key, reducer) => {
    if (store.asyncReducers[key]) {
        return;
    }
    store.asyncReducers[key] = reducer;
    store.replaceReducer(createReducer(store.asyncReducers));
    return store;
};