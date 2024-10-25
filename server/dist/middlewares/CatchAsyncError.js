"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatchAsyncError = void 0;
const CatchAsyncError = (thefunc) => (req, res, next) => {
    thefunc(req, res, next).catch(next);
};
exports.CatchAsyncError = CatchAsyncError;
