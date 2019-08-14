import React, {Component} from 'react';
import {
    withStyles,
    MuiThemeProvider,
    Hidden,
    Icon,
    IconButton,
    Input,
    Paper,
    Typography,
} from '@material-ui/core';
import {FuseAnimate} from '../../../@fuse';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as Actions from './store/actions';

const styles = theme => ({
        content: {
            '& canvas': {
                maxHeight: '100%'
            }
        },
        selectedProject: {
            fontSize: '1rem',
            background: '#d7f1ff',
            color: '#525252',
            fontWeight: 'bold',
            borderRadius: '8px 8px 0 0',
        },
        projectMenuButton: {
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: '0 8px 0 0',
            marginLeft: 1
        },
    }
);

class SuperAdminHeader extends Component {

    render() {
        const {setSearchText, searchText, pageLayout, mainTheme} = this.props;

        return (
            <div className="flex flex-col justify-between flex-1 px-24 pt-24">
                <div className="flex justify-between items-start">

                    <div className="flex flex-shrink items-center sm:w-224">
                        <Hidden lgUp>
                            <IconButton
                                onClick={(ev) => pageLayout().toggleLeftSidebar()}
                                aria-label="open left sidebar"
                            >
                                <Icon>menu</Icon>
                            </IconButton>
                        </Hidden>

                        <div className="flex items-center">
                            <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                                <Typography variant="h6" className="hidden sm:flex">Super Admin</Typography>
                            </FuseAnimate>
                        </div>
                    </div>

                    <div className="flex flex-1 items-center justify-center pr-8 sm:px-12">

                        <MuiThemeProvider
                            theme={mainTheme}>
                            <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                                <Paper
                                    style={{height: '30px'}}
                                    className="flex p-4 items-center w-full max-w-512 search" elevation={1}>

                                    <Icon className="mr-8" color="action">search</Icon>

                                    <Input
                                        placeholder="Search for anything"
                                        className="flex flex-1"
                                        disableUnderline
                                        fullWidth
                                        value={searchText}
                                        inputProps={{
                                            'aria-label': 'Search'
                                        }}
                                        onChange={setSearchText}
                                    />
                                </Paper>
                            </FuseAnimate>
                        </MuiThemeProvider>
                    </div>
                </div>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setSearchText: Actions.setSearchText
    }, dispatch);
}

function mapStateToProps(state) {
    return {
        searchText: state.SuperAdminStates.communities.searchText,
        mainTheme: state.fuse.settings.mainTheme
    }
}

export default withStyles(styles, {withTheme: true})(connect(mapStateToProps, mapDispatchToProps)(SuperAdminHeader));
