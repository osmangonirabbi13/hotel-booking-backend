/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { generateHotelInvoicePdf } from "./payment.utils";

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
 
  const existingPayment = await prisma.payment.findFirst({
    where: { stripeEventId: event.id },
  });

  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` };
  }

  // ── Event router ──────────────────────────────────────────────────────
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;

      if (!bookingId || !paymentId) {
        console.error("⚠️ Missing metadata in webhook event");
        return { message: "Missing metadata" };
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          room: {
            include: {
              category: true,
            },
          },
          payment: true,
        },
      });

      if (!booking) {
        console.error(`⚠️ Booking ${bookingId} not found.`);
        return { message: "Booking not found" };
      }

      const isPaid = session.payment_status === "paid";

      let pdfBuffer: Buffer | undefined;

      const result = await prisma.$transaction(async (tx) => {
        const updatedBooking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: isPaid ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
          },
        });

        let invoiceUrl: string | null = null;

        if (isPaid) {
          try {
            const nights = Math.ceil(
              (new Date(booking.checkOut).getTime() -
                new Date(booking.checkIn).getTime()) /
                (1000 * 60 * 60 * 24),
            );

            const ratePerNight = booking.room.rent;
            const totalAmount = booking.payment?.amount ?? booking.totalPrice;

            const roomLabel =
              booking.room.roomTitle ??
              booking.room.category?.name ??
              "Standard Room";

            pdfBuffer = await generateHotelInvoicePdf({
              bookingId: booking.id,
              transactionId: booking.payment?.transactionId ?? "",
              paymentDate: new Date().toISOString(),
              paymentMethod: session.payment_method_types?.[0] ?? "Card",

              guestName: booking.customer.name,
              guestEmail: booking.customer.email,

              hotelName: process.env.HOTEL_NAME ?? "HotelBook",
              hotelLocation: process.env.HOTEL_LOCATION ?? "",
              roomType: roomLabel,

              checkIn: booking.checkIn.toISOString(),
              checkOut: booking.checkOut.toISOString(),
              nights,
              guests: booking.guests,

              ratePerNight,
              taxes: 0,
              discount: 0,
              totalAmount,
            });

            const cloudinaryResponse = await uploadFileToCloudinary(
              pdfBuffer,
              `hotelbook/invoices/invoice-${paymentId}-${Date.now()}.pdf`,
            );

            invoiceUrl = cloudinaryResponse?.secure_url ?? null;
            console.log(
              `✅ Invoice PDF generated and uploaded for payment ${paymentId}`,
            );
          } catch (pdfError) {
            console.error(
              "❌ Error generating/uploading invoice PDF:",
              pdfError,
            );
          }
        }

        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: isPaid ? PaymentStatus.PAID : PaymentStatus.FAILED,
            paymentGatewayData: session,
            invoiceUrl,
            stripeEventId: event.id,
          },
        });

        return { updatedBooking, updatedPayment, invoiceUrl };
      });

      // ── Send confirmation email (outside transaction) ─────────────
      
      if (isPaid && booking.customer?.email) {
        try {
          const nights = Math.ceil(
            (new Date(booking.checkOut).getTime() -
              new Date(booking.checkIn).getTime()) /
              (1000 * 60 * 60 * 24),
          );

          const roomLabel =
            booking.room.roomTitle ??
            booking.room.category?.name ??
            "Standard Room";

          const guestEmail = booking.customer.email;
          const guestName = booking.customer.name || "Guest";
          const transactionId = booking.payment?.transactionId || "N/A";
          const totalAmount = booking.payment?.amount ?? booking.totalPrice;
          const ratePerNight = booking.room.rent;
          const taxes = 0;
          const paymentMethod = session.payment_method_types?.[0] ?? "Card";

          const attachments: {
            filename: string;
            content: Buffer;
            contentType: string;
          }[] = [];

          if (Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 0) {
            attachments.push({
              filename: `HotelBook-Receipt-${booking.id}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            });
          }

          const emailPayload: {
            to: string;
            subject: string;
            templateName: string;
            templateData: Record<string, unknown>;
            attachments?: {
              filename: string;
              content: Buffer;
              contentType: string;
            }[];
          } = {
            to: guestEmail,
            subject: `Booking Confirmed 🏨 – ${
              process.env.HOTEL_NAME ?? "HotelBook"
            } | ${booking.id}`,
            templateName: "invoice",
            templateData: {
              guestName,

              bookingId: booking.id,
              transactionId,
              paymentDate: new Date().toLocaleDateString("en-BD", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              paymentMethod,

              hotelName: process.env.HOTEL_NAME ?? "HotelBook",
              hotelLocation: process.env.HOTEL_LOCATION ?? "",
              roomType: roomLabel,

              checkIn: new Date(booking.checkIn).toLocaleDateString("en-BD", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              checkOut: new Date(booking.checkOut).toLocaleDateString("en-BD", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              nights,
              guests: booking.guests,

              ratePerNight,
              taxes,
              discount: 0,
              totalAmount,

              invoiceUrl: result.invoiceUrl ?? "",
            },
          };

          if (attachments.length > 0) {
            emailPayload.attachments = attachments;
          }

          await sendEmail(emailPayload);

          console.log(` Booking confirmation email sent to ${guestEmail}`);
        } catch (emailError) {
          console.error(
            " Error sending booking confirmation email:",
            emailError,
          );
        }
      }

      console.log(
        `Payment ${session.payment_status} for booking ${bookingId}`,
      );
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as any;
      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;

      console.log(`Checkout session ${session.id} expired.`);

      await prisma
        .$transaction(async (tx) => {
          if (bookingId) {
            await tx.booking.update({
              where: { id: bookingId },
              data: { status: BookingStatus.CANCELLED },
            });
          }

          if (paymentId) {
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                status: PaymentStatus.FAILED,
                stripeEventId: event.id,
              },
            });
          }
        })
        .catch((err) =>
          console.error("Failed to update expired session records:", err),
        );

      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as any;
      const paymentId = intent.metadata?.paymentId;

      console.log(`Payment intent ${intent.id} failed.`);

      if (paymentId) {
        await prisma.payment
          .update({
            where: { id: paymentId },
            data: {
              status: PaymentStatus.FAILED,
              stripeEventId: event.id,
            },
          })
          .catch((err) =>
            console.error(
              `Failed to mark payment ${paymentId} as FAILED:`,
              err,
            ),
          );
      }

      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as any;
      const paymentId = charge.metadata?.paymentId;
      const bookingId = charge.metadata?.bookingId;

      console.log(`Charge ${charge.id} refunded.`);

      await prisma
        .$transaction(async (tx) => {
          if (paymentId) {
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                status: PaymentStatus.REFUNDED,
                stripeEventId: event.id,
              },
            });
          }

          if (bookingId) {
            await tx.booking.update({
              where: { id: bookingId },
              data: { status: BookingStatus.CANCELLED },
            });
          }
        })
        .catch((err) => console.error("Failed to update refund records:", err));

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { message: `Webhook event ${event.id} processed successfully` };
};

export const PaymentService = {
  handlerStripeWebhookEvent,
};