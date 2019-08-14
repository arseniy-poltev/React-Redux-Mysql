import React from 'react';
import classnames from 'classnames';
import {withStyles} from '@material-ui/core/styles';
import {CardContent, Collapse, CardActions, IconButton} from "@material-ui/core";
import {AccountCircle, ExpandMore} from '@material-ui/icons';

const styles = theme => ({
    row: {
        margin: '0',
        left: '0'
    },
    actions: {
        margin: '0',
        left: '0',
        padding: '0!important'
    },
    description: {
        width: '100%',
        minHeight: '200px',
        border: '2px #9fdbf0 solid',
        whiteSpace: 'pre-wrap',
        padding: '10px'
    },
    files: {
        textAlign: 'center',
        color: '#73b2f8',
        fontWeight: 'normal',
        wordBreak: 'break-all'
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
});

class AcceptList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            duration: 0,
            expanded: false
        };
        this.handleExpandClick = this.handleExpandClick.bind(this);
    }

    componentDidMount() {
        const currDate = new Date();
        const endDate = new Date(this.props.acceptedData.deadline);
        currDate.setHours(currDate.getHours() + currDate.getTimezoneOffset() / 60);
        const diffDate = Math.round((endDate.getTime() - currDate.getTime()) / (3600 * 24 * 1000));
        this.setState({
            duration: diffDate
        })
    }

    handleExpandClick = () => {
        this.setState(state => ({expanded: !state.expanded}));
    };

    render() {
        return (
            <CardContent className={classnames(this.props.classes.actions)}>
                <CardActions
                    className={classnames(this.props.classes.actions, "row", "col-md-12")}
                    disableActionSpacing>
                    <div className={classnames(this.props.classes.row, "row", "col-md-2")}>
                        <AccountCircle/>&nbsp;&nbsp;
                        <span>{this.props.acceptedData.firstName + ' ' + this.props.acceptedData.lastName}</span>
                    </div>
                    <div className={classnames(this.props.classes.row, "row", "col-md-5")}>
                        <span><strong>Proposal:&nbsp;&nbsp;</strong></span>
                        <span>Carried out in &nbsp;&nbsp;</span>
                        <span style={{width: '5%', margin: 0, fontWeight: 'bold'}}>
                                    {this.state.duration >= 0 ? this.state.duration : 0}
                                </span>
                        <span>&nbsp;&nbsp;days&nbsp;&nbsp;with amount:&nbsp;&nbsp;</span>
                        <span style={{width: '5%', margin: 0, fontWeight: 'bold'}}>
                                {this.props.acceptedData.amount}
                            </span>
                    </div>
                    <div className={classnames(this.props.classes.row, "row", "col-md-4")}>
                        {
                            JSON.parse(this.props.acceptedData.attachments)
                            && JSON.parse(this.props.acceptedData.attachments).length > 0
                            && <a
                                rel='noreferrer noopener'
                                className={classnames(this.props.classes.files)}
                                href={JSON.parse(this.props.acceptedData.attachments)[0].attachmentName}
                                target="_blank"
                                download>
                                {
                                    JSON.parse(this.props.acceptedData.attachments)[0].originalFileName
                                }
                            </a>
                        }
                    </div>
                    <div className={classnames(this.props.classes.row, "row", "col-md-1")} style={{float: 'right'}}>
                        <IconButton
                            className={classnames(this.props.classes.expand, {
                                [this.props.classes.expandOpen]: this.state.expanded,
                            })}
                            onClick={this.handleExpandClick}
                            aria-expanded={this.state.expanded}
                            aria-label="Show more"
                        >
                            <ExpandMore/>
                        </IconButton>
                    </div>
                </CardActions>
                <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
                    <CardContent className={classnames(this.props.classes.row, "row", "col-md-12")}>
                        <div className={classnames(this.props.classes.description)}>
                            {this.props.acceptedData.description}
                        </div>
                    </CardContent>
                </Collapse>
                <hr style={{margin: '0'}}/>
            </CardContent>
        )
    }
}

export default withStyles(styles)(AcceptList);