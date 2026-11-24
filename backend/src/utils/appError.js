export class AppError extends Error{
    constructor(statusCodes, codes, message, details = null){
        super(message);
        this.statusCode= this.statusCode;
        this.code= this.code;
        this.details=details;
    }
}