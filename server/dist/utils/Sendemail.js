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
// src/utils/emailService.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        const { email, subject, template, data } = options;
        const templatePath = path_1.default.join(__dirname, process.env.NODE_ENV === 'production' ? '../../src/mails' : '../mails', `${template}`);
        // Render template with provided data
        const html = yield ejs_1.default.renderFile(templatePath, data);
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: email,
            subject,
            html,
        };
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        throw new Error(`Error sending email: ${error}`);
    }
});
exports.default = sendEmail;
