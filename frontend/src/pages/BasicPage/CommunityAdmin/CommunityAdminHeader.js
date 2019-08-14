import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {
    MuiThemeProvider,
    Hidden,
    Icon,
    IconButton,
    Paper,
    Input,
    Typography,
    Tabs,
    Tab
} from '@material-ui/core';
import {FuseAnimate} from '../../../@fuse';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';
import classNames from 'classnames';
import {connect} from 'react-redux';
import * as Actions from './store/actions';

const styles = theme => ({
        selectedProject: {
            fontSize: '1rem',
            background: '#d7f1ff',
            color: '#525252',
            fontWeight: 'bold',
            borderRadius: '8px 8px 0 0',
        },
    }
);

class CommunityAdminHeader extends Component {
    handleChange = (event, value) => {
        value === 0
            ? setTimeout(() => this.props.history.push(
            "/admin/cards/" + this.props.match.params.communityId
            ), 300)
            : setTimeout(() => this.props.history.push(
            "/admin/users/all/" + this.props.match.params.communityId
            ), 300)
    };

    render() {
        const {classes, setSearchText, searchText, pageLayout, mainTheme} = this.props;

        return (
            <div className="flex flex-col justify-between flex-1 px-24 pt-24" style={{height: '150px'}}>
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
                                <Typography variant="h6" className="hidden sm:flex">Community Admin</Typography>
                            </FuseAnimate>
                        </div>
                    </div>

                    <div className="flex flex-1 items-center justify-center pr-8 sm:px-12">

                        <MuiThemeProvider
                            theme={mainTheme}>
                            <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                                <Paper
                                    className="flex p-4 items-center w-full max-w-512 search"
                                    elevation={1}>

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
                <div className="flex items-end">
                    <div className="flex items-center">
                        <Tabs
                            value={this.props.match.url.includes('cards') ? 0 : 1}
                            indicatorColor="primary"
                            textColor="primary"
                            onChange={this.handleChange}
                        >
                            <Tab
                                className={classNames(classes.selectedProject, "flex items-center h-10 px-8 text-4")}
                                value={0}
                                label="Activity Management"/>
                            <Tab
                                className={classNames(classes.selectedProject, "flex items-center h-10 px-8 text-4")}
                                value={1}
                                label="User Management"/>
                        </Tabs>
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
        searchText: state.CommunityAdminStates.users.searchText,
        mainTheme: state.fuse.settings.mainTheme
    }
}

export default withStyles(styles, {withTheme: true})(withRouter(connect(mapStateToProps, mapDispatchToProps)(CommunityAdminHeader)));
