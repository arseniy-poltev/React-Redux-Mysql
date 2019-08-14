module.exports = {
    userJoinStatus: {
        UNJOINED: 0,
        REQUEST_JOIN: 1,
        ACCEPTED: 2
    },
    userType: {
        USER: 0,
        ADMIN: 1,
        SUPER_ADMIN: 2,
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
        ASK: 0,
        OFFER: 1,
        ANNOUNCE: 2,
        EMERGENCY: 3
    },
    activityTagType: {
        LOW: 1,
        MEDIUM: 2,
        HIGH: 3
    },
    activityStatus: {
        ACTIVE: 1,
        DE_ACTIVE: 0,
    },
    emergencyType: {
        EMERGENCY: 1,
        NO_EMERGENCY: 0
    },
    verifiedUserType: {
        VERIFIED: 1,
        UNVERIFIED: 0
    }
};