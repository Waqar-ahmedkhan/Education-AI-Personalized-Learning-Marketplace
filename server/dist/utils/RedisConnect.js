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
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.client = void 0;
const redis_1 = require("redis");
require("dotenv").config();
// Create a Redis client
exports.client = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.client.on("error", (err) => {
    console.log("Redis Client Error:", err);
});
// Connect to Redis
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.client.connect();
        console.log("Redis connected successfully");
    }
    catch (error) {
        console.error("Error connecting to Redis:", error);
    }
});
exports.connectRedis = connectRedis;
