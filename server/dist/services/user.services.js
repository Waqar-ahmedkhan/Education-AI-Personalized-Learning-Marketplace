"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserRoleServices = exports.getalluserServices = exports.getUserbyId = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const RedisConnect_1 = require("../utils/RedisConnect");
const getUserbyId = (id, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userJson = yield RedisConnect_1.client.get(id);
    if (userJson) {
        const user = JSON.parse(userJson);
        res.status(201).json({
            success: true,
            user,
        });
    }
});
exports.getUserbyId = getUserbyId;
const getalluserServices = (res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        message: "message in coding",
        users,
    });
});
exports.getalluserServices = getalluserServices;
const UpdateUserRoleServices = (res, id, role) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.findByIdAndUpdate(id, { role }, { new: true });
    res.status(201).json({
        success: true,
        message: "message in coding",
        users,
    });
});
exports.UpdateUserRoleServices = UpdateUserRoleServices;
