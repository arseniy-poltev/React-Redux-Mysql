const local = false;
export default {
    baseURL: local ? `http://localhost:1367` : `http://18.191.226.114`,
    userJoinStatus: {
        UNJOINED: 0,
        REQUEST_JOIN: 1,
        ACCEPTED: 2
    },
    userType: {
        SUPER_ADMIN: 2,
        ADMIN: 1,
        USER: 0
    },
    taskStatus: {
        START: 1,
        RUNNING: 2,
        COMPLETED: 3
    },
    loginStatus: {
        ONLINE: 1,
        OFFLINE: 2
    },
    //activity type
    activityType: {
        ASK: 1,
        OFFER: 2,
        ANNOUNCE: 3,
        SHARED_STORIES: 4,
        SEARCH: 5
    },
    columnType: {
        ASK_OFFER: 1,
        ANNOUNCE: 2,
        SHARED_STORIES: 3,
        EMERGENCY: 4
    },
    activityTagType: {
        LOW: 1,
        MEDIUM: 2,
        HIGH: 3
    },
    activityStatus: {
        ACTIVE: 1,
        INACTIVE: 0,
    }
};
