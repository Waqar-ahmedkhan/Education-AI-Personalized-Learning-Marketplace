import { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middlewares/CatchAsyncError';
import { AppError } from '../utils/AppError';
import UserModel from '../models/user.model';
import CourseModel, { ICourse } from '../models/Course.model';
import { NotificaModel } from '../models/Notification.model';
import { client } from '../utils/RedisConnect';
import sendEmail from '../utils/Sendemail';
import path from 'path';
import ejs from 'ejs';
import { newOrder } from '../services/order.services';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      return next(new AppError('Webhook secret not configured', 500));
    }

    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { userId, courseId, orderNumber } = session.metadata;

        const user = await UserModel.findById(userId);
        const course = await CourseModel.findById(courseId);

        if (!user || !course) {
          return next(new AppError('User or course not found', 404));
        }

        const courseExistInUser = user.courses.some(
          (c: any) => c.courseId.toString() === courseId
        );

        if (!courseExistInUser) {
          user.courses.push({ courseId });
          await client.set(userId, JSON.stringify(user));
          await user.save();

          course.purchased = (course.purchased || 0) + 1;
          await course.save();

          const data = {
            userId,
            courseId,
            payment_info: {
              id: session.payment_intent as string,
              status: session.payment_status as string,
            },
          };
          const order = await newOrder(data, res, next);
          if (!order) {
            return next(new AppError('Order creation failed', 500));
          }

          const mailData = {
            order: {
              id: orderNumber,
              name: course.name,
              price: course.price,
              date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            },
          };

          const html = await ejs.renderFile(
            path.join(__dirname, '../mails/order-confirmation.ejs'),
            { order: mailData }
          );

          await sendEmail({
            email: user.email,
            subject: 'Order Confirmation',
            template: 'order-confirmation.ejs',
            data: mailData,
          });

          await NotificaModel.create({
            user: user._id,
            title: 'New Order',
            message: `You have a new order from ${course.name}`,
          });
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      return next(new AppError(`Webhook Error: ${error.message}`, 400));
    }
  }
);