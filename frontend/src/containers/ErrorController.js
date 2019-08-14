export const ErrorController = (error) => {
    console.error("Error: ", error);
    if ((error.request && error.request.status === 403)
        || (error.response && error.response.status === 403)) {
        localStorage.clear();
        window.location.reload();
    }
};