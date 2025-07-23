const AppError = require("./appError");

module.exports = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    console.error('Unexpected error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
};