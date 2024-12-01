exports.sendResponse = (res, status, success, message, data = null) => {
    const response = { status, success, message };
    if (data !== null) response.data = data;
    res.status(status).json(response);
};
