import React from "react";
import {Column} from "../Column";
import {CardView} from "../CardView";
import DetailModalComponent from "../DetailModal/index";
import connect from "react-redux/es/connect/connect";
import BoardHeader from "./BoardHeader";
import config from '../../../../config';
import {NotificationManager} from "react-notifications";

const COLUMN_TYPE = config.columnType;
const ACTIVITY_TYPE = config.activityType;
const getPlaceHolder = (index) => {
    switch (index) {
        case ACTIVITY_TYPE.ASK:
        case ACTIVITY_TYPE.OFFER:
            return "Write here what you would like to ask for or offer";
        case ACTIVITY_TYPE.ANNOUNCE:
            return "Write here what you would like to announce";
        case ACTIVITY_TYPE.SHARED_STORIES:
            return "Write here stories you would like to share";
        case ACTIVITY_TYPE.SEARCH:
            return "Write here what you would like to search";
        default:
            return "";
    }
};

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            activityType: ACTIVITY_TYPE.ASK,
            showPostModal: false,
            showDetailModal: false,
            itemsToShow: [5, 5, 5, 5],
            expandable: [false, false, false, false],
            activeCard: null,
            inputPlaceHolder: getPlaceHolder(ACTIVITY_TYPE.ASK)
        };
        this.onChangeTitleHandler = this.onChangeTitleHandler.bind(this);
        this.onOptionClickHandler = this.onOptionClickHandler.bind(this);
        this.onSending = this.onSending.bind(this);
        this.togglePostModal = this.togglePostModal.bind(this);
        this.toggleDetailModal = this.toggleDetailModal.bind(this);
        this.addCard = this.addCard.bind(this);
        this.showMoreItems = this.showMoreItems.bind(this);
        this.changeActivityType = this.changeActivityType.bind(this);
    }

    onChangeTitleHandler(e) {
        this.setState({
            title: e.target.value
        })
    }

    onOptionClickHandler(activityType) {
        this.setState({
            activityType,
            inputPlaceHolder: getPlaceHolder(activityType)
        })
    }

    onSending(e) {
        if (e.charCode === 13 && !e.shiftKey) {
            e.preventDefault();
            this.togglePostModal();
        }
    }

    changeActivityType(columnType) {
        this.onOptionClickHandler(
            columnType === COLUMN_TYPE.ASK_OFFER
                ? ACTIVITY_TYPE.ASK
                : columnType === COLUMN_TYPE.ANNOUNCE
                ? ACTIVITY_TYPE.ANNOUNCE
                : columnType === COLUMN_TYPE.SHARED_STORIES
                    ? ACTIVITY_TYPE.SHARED_STORIES
                    : null
        );
        this.togglePostModal();
    }

    togglePostModal() {
        this.setState({
            showPostModal: this.state.activityType !== ACTIVITY_TYPE.SEARCH ?
                !this.state.showPostModal : this.state.showPostModal,
        }, () => {
            this.setState({
                title: ''
            })
        })
    }

    toggleDetailModal(isOpen, card) {
        this.setState({
            activeCard: card ? card : null,
            showDetailModal: isOpen
        })
    }

    addCard(card) {
        NotificationManager.success("Success");
        this.props.addCard(card)
    }

    showMoreItems(expandable, columnId) {
        if (expandable) {
            if (this.props.columns[columnId - 1].cardIds.length > this.state.itemsToShow[columnId - 1] + 5) {
                this.setState(prevState => ({
                    itemsToShow: prevState.itemsToShow.map((oneColItems, index) => index === columnId - 1 ?
                        prevState.itemsToShow[index] + 5 :
                        prevState.itemsToShow[index])
                }))
            } else {
                this.setState(prevState => ({
                    itemsToShow: prevState.itemsToShow.map((oneColItems, index) => index === columnId - 1 ?
                        this.props.columns[columnId - 1].cardIds.length :
                        prevState.itemsToShow[index]),
                    expandable: prevState.expandable.map((oneState, index) => index === columnId - 1 ?
                        true : prevState.expandable[index]
                    )
                }))
            }
        } else {
            this.setState(prevState => ({
                itemsToShow: prevState.itemsToShow.map((oneColItems, index) => index === columnId - 1 ?
                    5 : prevState.itemsToShow[index]),
                expandable: prevState.expandable.map((oneState, index) => index === columnId - 1 ?
                    false : prevState.expandable[index]
                )
            }))
        }
    }

    render() {
        return (
            <div className="container-fluid pt-3">
                <div style={{margin: '20px 0'}}>
                    <h3 style={{display: "inline", color: '#43425d'}}>Hello Paul,</h3><p
                    style={{display: "inline", color: '#52516a'}}> What would you like to do?</p>
                </div>
                <br/>
                <BoardHeader
                    onOptionClickHandler={this.onOptionClickHandler}
                    onSending={this.onSending}
                    onChangeTitleHandler={this.onChangeTitleHandler}
                    title={this.state.title}
                    togglePostModal={this.togglePostModal}
                    showPostModal={this.state.showPostModal}
                    activityType={this.state.activityType}
                    addCard={this.addCard}
                    inputPlaceHolder={this.state.inputPlaceHolder}
                />
                <div className="row flex-sm-nowrap  col-md-12 Board">
                    {this.props.columns && this.props.columns.map(column => (
                        <Column
                            key={column.id}
                            title={column.title}
                            id={column.id}
                            numCards={column.cardIds.length}
                            expanded={this.state.expandable[column.id - 1]}
                            onNewPost={this.togglePostModal}
                            changeActivityType={this.changeActivityType}
                            showItemsHandler={this.showMoreItems}>
                            {
                                column.cardIds.length > 0 ? column.cardIds.slice(0, this.state.itemsToShow[column.id - 1])
                                    .map(cardId => this.props.activities.find(card => card.id === cardId))
                                    .map((card, index) => (
                                        <CardView
                                            key={card.id}
                                            id={card.id}
                                            columnId={column.id}
                                            columnIndex={index}
                                            cardInfo={card}
                                            userId={card.userId}
                                            activityType={card.activityType}
                                            postedDateTime={card.startDate}
                                            title={card.title}
                                            numAccepts={card.accepts ? card.accepts.length : 0}
                                            description={card.description}
                                            numAttachments={JSON.parse(card.attachments).length}
                                            numComments={JSON.parse(card.comments).length}
                                            activityTag={card.activityTag}
                                            onClick={this.toggleDetailModal}
                                            // moveCard={moveCard}
                                        />
                                    )) : (
                                    <CardView
                                        isSpacer
                                        // moveCard={cardId => moveCard(cardId, column.id, 0)}
                                    />)
                            }
                        </Column>
                    ))}
                </div>
                {
                    this.state.showDetailModal ?
                        <DetailModalComponent
                            isOpen={this.state.showDetailModal}
                            toggleModal={this.toggleDetailModal}
                            cardDetail={this.state.activeCard}
                        /> :
                        null
                }
            </div>
        );
    }
}

const mapStateToProps = ({DashboardStates}) => {
    return {
        activities: DashboardStates.activities.all,
        columns: DashboardStates.activities.columns
    }
};

export default connect(mapStateToProps)(Board);
