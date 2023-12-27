const errorHandler = (err, req, res, next) => {

    console.log("Error Handler Error:" , err)
    
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode).json({
        Error: "INTERNAL SERVER ERROR",
        message: err.message,
        stack: err.stack,
        errInfo: err
    });
};

module.exports = { errorHandler };
