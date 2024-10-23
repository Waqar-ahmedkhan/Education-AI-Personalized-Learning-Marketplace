"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatchAsyncError = void 0;
const CatchAsyncError = (thefunc) => (req, res, next) => {
    Promise.resolve(thefunc(req, res, next(next)));
};
exports.CatchAsyncError = CatchAsyncError;
