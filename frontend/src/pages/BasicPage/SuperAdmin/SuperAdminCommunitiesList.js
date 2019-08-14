import React, {Component} from 'react';
import {
    Checkbox,
    Icon,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    Typography
} from '@material-ui/core';
import {FuseUtils, FuseAnimate} from '../../../@fuse';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {bindActionCreators} from 'redux';
import ReactTable from "react-table";
import * as Actions from './store/actions';
import 'react-table/react-table.css';

class SuperAdminCommunitiesList extends Component {
    state = {
        selectedCardsMenu: null
    };

    getFilteredArray = (entities, searchText) => {
        const arr = Object.keys(entities).map((id) => entities[id]);
        if (searchText.length === 0) {
            return arr;
        }
        return FuseUtils.filterArrayByString(arr, searchText);
    };

    openSelectedCardsMenu = (event) => {
        this.setState({selectedCardsMenu: event.currentTarget});
    };

    closeSelectedCardsMenu = () => {
        this.setState({selectedCardsMenu: null});
    };

    render() {
        const {
            communities,
            searchText,
            openCommunityDetailDialog,
            selectedCommunityIds,
            selectAllCommunities,
            deSelectAllCommunities,
            toggleInSelectedCommunities,
            removeCommunities
        } = this.props;
        const data = this.getFilteredArray(communities, searchText).sort((a, b) => {
            return b.id - a.id;
        });
        const {selectedCardsMenu} = this.state;

        if (!data || data.length === 0) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Typography color="textSecondary" variant="h5">
                        There are no Community!
                    </Typography>
                </div>
            );
        }
        return (
            <FuseAnimate animation="transition.slideUpIn" delay={300}>
                <ReactTable
                    resizable={false}
                    className="-striped -highlight border-0"
                    getTrProps={(state, rowInfo, column) => {
                        return {
                            className: "cursor-pointer",
                            onClick: (e, handleOriginal) => {
                                if (rowInfo) {
                                    openCommunityDetailDialog(rowInfo.original);
                                }
                            }
                        }
                    }}
                    data={data}
                    columns={[
                        {
                            Header: () => (
                                <Checkbox
                                    onClick={(event) => {
                                        event.stopPropagation();
                                    }}
                                    onChange={(event) => {
                                        event.target.checked ? selectAllCommunities() : deSelectAllCommunities();
                                    }}
                                    checked={selectedCommunityIds.length === Object.keys(communities).length && selectedCommunityIds.length > 0}
                                    indeterminate={selectedCommunityIds.length !== Object.keys(communities).length && selectedCommunityIds.length > 0}
                                />
                            ),
                            accessor: "",
                            Cell: row => {
                                return (<Checkbox
                                        onClick={(event) => {
                                            event.stopPropagation();
                                        }}
                                        checked={selectedCommunityIds.includes(row.value.id)}
                                        onChange={() => toggleInSelectedCommunities(row.value.id)}
                                    />
                                )
                            },
                            className: "justify-center",
                            sortable: false,
                            width: 64
                        },
                        {
                            Header: () => (
                                selectedCommunityIds.length > 0 &&
                                <React.Fragment>
                                    <IconButton
                                        aria-owns={selectedCardsMenu ? 'selectedCardsMenu' : null}
                                        aria-haspopup="true"
                                        onClick={this.openSelectedCardsMenu}
                                    >
                                        <Icon>more_horiz</Icon>
                                    </IconButton>
                                    <Menu
                                        id="selectedCardsMenu"
                                        anchorEl={selectedCardsMenu}
                                        open={Boolean(selectedCardsMenu)}
                                        onClose={this.closeSelectedCardsMenu}
                                    >
                                        <MenuList>
                                            <MenuItem
                                                onClick={() => {
                                                    removeCommunities(selectedCommunityIds);
                                                    this.closeSelectedCardsMenu();
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <Icon>delete</Icon>
                                                </ListItemIcon>
                                                <ListItemText inset primary="Remove"/>
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                </React.Fragment>
                            ),
                            className: "justify-center",
                            width: 64,
                            sortable: false
                        },
                        {
                            Header: "Community Name",
                            accessor: "name",
                            filterable: true,
                            className: "font-bold justify-center"
                        },
                        {
                            Header: "Number of Administrators",
                            accessor: "admins",
                            filterable: true,
                            Cell: row => row.original.admins.length,
                            className: "justify-center",
                        },
                        {
                            Header: "Number of Users",
                            accessor: "numUsers",
                            filterable: true,
                            className: "justify-center",
                        },
                        {
                            Header: "Number of Posts",
                            accessor: "numPosts",
                            filterable: true,
                            className: "justify-center",
                        },
                        {
                            Header: "Number of Active Posts",
                            accessor: "numActivePosts",
                            filterable: true,
                            className: "justify-center",
                        },
                    ]}
                    defaultPageSize={10}
                    noDataText="No Community found"
                />
            </FuseAnimate>
        );
    }
}


function mapStateToProps({SuperAdminStates}) {
    return {
        communities: SuperAdminStates.communities.entities,
        selectedCommunityIds: SuperAdminStates.communities.selectedCommunityIds,
        searchText: SuperAdminStates.communities.searchText,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        toggleInSelectedCommunities: Actions.toggleInSelectedCommunities,
        selectAllCommunities: Actions.selectAllCommunities,
        deSelectAllCommunities: Actions.deSelectAllCommunities,
        openCommunityDetailDialog: Actions.openCommunityDetailDialog,
    }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SuperAdminCommunitiesList));
