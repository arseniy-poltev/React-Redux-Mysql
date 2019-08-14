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
import {AccountCircle} from "@material-ui/icons";

class CommunityAdminCardsList extends Component {
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
            activities,
            searchText,
            openCardDetailDialog,
            selectedActivityIds,
            selectAllActivities,
            deSelectAllActivities,
            toggleInSelectedActivities,
        } = this.props;
        const data = this.getFilteredArray(activities, searchText).sort((a, b) => {
            return b.id - a.id;
        });
        const {selectedCardsMenu} = this.state;

        if (!data || data.length === 0) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Typography color="textSecondary" variant="h5">
                        There are no Activity!
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
                                    openCardDetailDialog(rowInfo.original);
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
                                        event.target.checked ? selectAllActivities() : deSelectAllActivities();
                                    }}
                                    checked={selectedActivityIds.length === Object.keys(activities).length && selectedActivityIds.length > 0}
                                    indeterminate={selectedActivityIds.length !== Object.keys(activities).length && selectedActivityIds.length > 0}
                                />
                            ),
                            accessor: "",
                            Cell: row => {
                                return (<Checkbox
                                        onClick={(event) => {
                                            event.stopPropagation();
                                        }}
                                        checked={selectedActivityIds.includes(row.value.id)}
                                        onChange={() => toggleInSelectedActivities(row.value.id)}
                                    />
                                )
                            },
                            className: "justify-center",
                            sortable: false,
                            width: 64
                        },
                        {
                            Header: () => (
                                selectedActivityIds.length > 0 &&
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
                                                    this.props.removeCards(selectedActivityIds);
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
                            accessor: "avatar",
                            Cell: row => (
                                <AccountCircle/>
                            ),
                            className: "justify-center",
                            width: 64,
                            sortable: false
                        },
                        {
                            Header: "Username",
                            accessor: "userName",
                            width: 140,
                            filterable: true,
                            className: "font-bold justify-center"
                        },
                        {
                            Header: "Title",
                            accessor: "title",
                            filterable: true,
                            className: "font-bold justify-center"
                        },
                        {
                            Header: "Start Date",
                            accessor: "startDate",
                            filterable: true,
                            width: 140,
                            className: "justify-center",
                            Cell: row => new Date(row.original.startDate).toLocaleDateString(),
                        },
                        {
                            Header: "End Date",
                            accessor: "endDate",
                            filterable: true,
                            width: 140,
                            className: "justify-center",
                            Cell: row => new Date(row.original.endDate).toLocaleDateString(),
                        },
                    ]}
                    defaultPageSize={10}
                    noDataText="No Activity found"
                />
            </FuseAnimate>
        );
    }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        toggleInSelectedActivities: Actions.toggleInSelectedActivities,
        selectAllActivities: Actions.selectAllActivities,
        deSelectAllActivities: Actions.deSelectAllActivities,
        openCardDetailDialog: Actions.openCardDetailDialog,
    }, dispatch);
}

function mapStateToProps({CommunityAdminStates}) {
    return {
        activities: CommunityAdminStates.activities.entities,
        selectedActivityIds: CommunityAdminStates.activities.selectedActivityIds,
        searchText: CommunityAdminStates.activities.searchText,
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CommunityAdminCardsList));
