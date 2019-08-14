import * as Actions from '../../actions/fuse/index';
import FuseSettingsConfig from '../../../../fuse-configs/settingsConfig';
import FuseThemesConfig from '../../../../fuse-configs/themesConfig';
import {createMuiTheme} from '@material-ui/core';
import _ from '../../../../@lodash/index';
import {
    defaultSettings,
    getParsedQuerySettings,
    defaultThemes,
    defaultThemeOptions,
    mustHaveThemeOptions,
    extendThemeWithMixins,
    mainThemeVariations
} from '../../../../@fuse/FuseDefaultSettings';
import {REHYDRATE} from "redux-persist/es/constants";

const initialSettings = getInitialSettings();
const initialThemes = getInitialThemes();

const initialState = {
    initial : initialSettings,
    defaults: _.merge({}, initialSettings),
    current : _.merge({}, initialSettings),
    themes  : initialThemes,
    ...getThemeOptions(initialThemes, initialSettings)
};

export const settings = function (state = initialState, action) {
    switch ( action.type )
    {
        case Actions.SET_SETTINGS:
        {
            const newSettings = _.merge({}, state.current, action.value)
            const themes = newSettings.theme.main !== state.current.theme.main ? {...state.themes, ...updateMainThemeVariations(newSettings.theme.main)} : state.themes;
            return {
                ...state,
                current: newSettings,
                themes,
                ...getThemeOptions(themes, newSettings)
            };
        }
        case Actions.SET_INITIAL_SETTINGS:
        {
            return _.merge({}, initialState);
        }
        case Actions.SET_DEFAULT_SETTINGS:
        {
            const newSettings = _.merge({}, state.defaults, action.value);
            const themes = newSettings.theme.main !== state.defaults.theme.main ? {...state.themes, ...updateMainThemeVariations(newSettings.theme.main)} : state.themes;
            return {
                ...state,
                defaults: _.merge({}, newSettings),
                current : _.merge({}, newSettings),
                themes,
                ...getThemeOptions(themes, newSettings)
            };
        }
        case Actions.RESET_DEFAULT_SETTINGS:
        {
            const themes = {...state.themes, ...updateMainThemeVariations(state.defaults.theme.main)};
            return {
                ...state,
                defaults: _.merge({}, state.defaults),
                current : _.merge({}, state.defaults),
                themes,
                ...getThemeOptions(themes, state.defaults)
            };
        }
        case REHYDRATE:
            return {...state};
        default:
        {
            return {...state};
        }
    }
};


/**
 * SETTINGS
 */
function getInitialSettings()
{
    const layout = {
        style : "layout1",
        config: {
            mode          : 'fullwidth',
            scroll        : 'content',
            navbar        : {
                display : true,
                folded  : false,
                position: 'left'
            },
            toolbar       : {
                display : true,
                style   : 'fixed',
                position: 'below'
            },
            footer        : {
                display : true,
                style   : 'fixed',
                position: 'below'
            },
            leftSidePanel : {
                display: true
            },
            rightSidePanel: {
                display: true
            }
        }
    };
    return _.merge({}, defaultSettings, {layout}, FuseSettingsConfig, getParsedQuerySettings());
}

/**
 * THEMES
 */
function getInitialThemes()
{
    const themesObj = Object.keys(FuseThemesConfig).length !== 0 ? FuseThemesConfig : defaultThemes;

    const themes = Object.assign({}, ...Object.entries(themesObj).map(([key, value]) => {
            const muiTheme = _.merge({}, defaultThemeOptions, value, mustHaveThemeOptions);
            return {
                [key]: createMuiTheme(_.merge({}, muiTheme, {mixins: extendThemeWithMixins(muiTheme)}))
            }
        }
    ));

    return {
        ...themes,
        ...mainThemeVariations(themesObj[initialSettings.theme.main])
    }
}

function updateMainThemeVariations(mainTheme)
{
    const themesObj = Object.keys(FuseThemesConfig).length !== 0 ? FuseThemesConfig : defaultThemes;
    return mainThemeVariations(themesObj[mainTheme])
}

function getThemeOptions(themes, settings)
{
    return {
        mainTheme   : themes[settings.theme.main],
        navbarTheme : themes[settings.theme.navbar],
        toolbarTheme: themes[settings.theme.toolbar],
        footerTheme : themes[settings.theme.footer],
        ...updateMainThemeVariations(settings.theme.main)
    }
}
