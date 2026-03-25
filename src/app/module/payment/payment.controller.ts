/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(status.BAD_REQUEST).json({
        success: false,
        message: "Missing Stripe signature or webhook secret",
      });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // must be raw buffer
        signature,
        webhookSecret,
      );
    } catch (error: any) {
      console.error("Error processing Stripe webhook:", error.message);
      return res.status(status.BAD_REQUEST).json({
        success: false,
        message: `Webhook Error: ${error.message}`,
      });
    }

    const result = await PaymentService.handlerStripeWebhookEvent(event);

    return sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result,
    });
  },
);

export const PaymentController = {
  handleStripeWebhookEvent,
};