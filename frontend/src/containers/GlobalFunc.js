export const getDiffStr = (dateTime) => {
    const currDate = new Date();
    const diffSec = Math.round((currDate.getTime() - dateTime.getTime()) / 1000);
    switch (true) {
        case diffSec < 60:
            return `${diffSec} seconds ago`;
        case diffSec < 120:
            return `a minute ago`;
        case diffSec < 3600:
            return `${Math.round(diffSec / 60)} minute ago`;
        case diffSec < 7200:
            return `a hour ago`;
        case diffSec < 3600 * 24:
            return `${Math.round(diffSec / 3600)} hours ago`;
        case diffSec < 3600 * 24 * 2:
            return `a day ago`;
        case diffSec < 3600 * 24 * 30:
            return `${Math.round(diffSec / (3600 * 24))} days ago`;
        case diffSec < 3600 * 24 * 30 * 2:
            return `a month ago`;
        default:
            return `${Math.round(diffSec / (3600 * 24 * 30))} months ago`;
    }
};