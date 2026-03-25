import { BookingStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../../lib/prisma";

// ─── Chart Helpers ────────────────────────────────────────────────────────────

const getBookingStatusDistribution = async (where?: { customerId?: string }) => {
  const distribution = await prisma.booking.groupBy({
    by: ["status"],
    _count: { id: true },
    ...(where && { where }),
  });

  return distribution.map(({ status, _count }) => ({
    status,
    count: _count.id,
  }));
};

const getMonthlyBookingAndRevenueChart = async () => {
  interface MonthlyStats {
    month: Date;
    bookingCount: bigint;
    revenue: number | null;
  }

  const data: MonthlyStats[] = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', b."createdAt")   AS month,
      CAST(COUNT(b.id) AS INTEGER)         AS "bookingCount",
      SUM(p.amount)                        AS revenue
    FROM "bookings" b
    LEFT JOIN "payments" p
      ON p."bookingId" = b.id AND p.status = ${PaymentStatus.PAID}::"PaymentStatus"
    GROUP BY month
    ORDER BY month ASC;
  `;

  return data;
};

const getRoomCategoryBreakdown = async () => {
  const breakdown = await prisma.room.groupBy({
    by: ["categoryId"],
    _count: { id: true },
  });

  const categories = await prisma.roomCategory.findMany({
    where: { id: { in: breakdown.map((r) => r.categoryId) } },
    select: { id: true, name: true },
  });

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return breakdown.map(({ categoryId, _count }) => ({
    category: categoryMap[categoryId] ?? "Unknown",
    count: _count.id,
  }));
};

// ─── Role-Based Stats ─────────────────────────────────────────────────────────

const getAdminStatsData = async () => {
  const [
    totalBookings,
    pendingBookings,
    totalRooms,
    activeRooms,
    featuredRooms,
    totalCustomers,
    totalRevenueResult,
    bookingStatusDistribution,
    monthlyChart,
    roomCategoryBreakdown,
    topRooms,
  ] = await Promise.all([
    prisma.booking.count(),

    prisma.booking.count({ where: { status: BookingStatus.PENDING } }),

    prisma.room.count(),

    prisma.room.count({ where: { isActive: true } }),

    prisma.room.count({ where: { isFeatured: true } }),

    prisma.customer.count(),

    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: PaymentStatus.PAID },
    }),

    getBookingStatusDistribution(),

    getMonthlyBookingAndRevenueChart(),

    getRoomCategoryBreakdown(),

    // Top 5 most booked rooms
    prisma.booking.groupBy({
      by: ["roomId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ]);

  // Hydrate top rooms with their titles
  const topRoomIds = topRooms.map((r) => r.roomId);
  const topRoomDetails = await prisma.room.findMany({
    where: { id: { in: topRoomIds } },
    select: { id: true, roomTitle: true, featuredImage: true, rent: true },
  });
  const roomDetailMap = Object.fromEntries(topRoomDetails.map((r) => [r.id, r]));

  const topBookedRooms = topRooms.map(({ roomId, _count }) => ({
    ...roomDetailMap[roomId],
    bookingCount: _count.id,
  }));

  return {
    totalBookings,
    pendingBookings,
    totalRooms,
    activeRooms,
    featuredRooms,
    totalCustomers,
    totalRevenue: totalRevenueResult._sum.amount ?? 0,
    bookingStatusDistribution,
    monthlyChart,
    roomCategoryBreakdown,
    topBookedRooms,
  };
};

const getCustomerStatsData = async (user: IRequestUser) => {
  const customerData = await prisma.customer.findUniqueOrThrow({
    where: { email: user.email },
  });

  const [
    totalBookings,
    upcomingBookings,
    totalSpentResult,
    bookingStatusDistribution,
    recentBookings,
    reviewCount,
  ] = await Promise.all([
    prisma.booking.count({
      where: { customerId: customerData.id },
    }),

    prisma.booking.count({
      where: {
        customerId: customerData.id,
        status: BookingStatus.CONFIRMED,
        checkIn: { gte: new Date() },
      },
    }),

    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: PaymentStatus.PAID,
        booking: { customerId: customerData.id },
      },
    }),

    getBookingStatusDistribution({ customerId: customerData.id }),

    prisma.booking.findMany({
      where: { customerId: customerData.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        totalPrice: true,
        status: true,
        guests: true,
        room: {
          select: {
            roomTitle: true,
            featuredImage: true,
            rent: true,
          },
        },
      },
    }),

    prisma.review.count({
      where: { customerId: customerData.id },
    }),
  ]);

  return {
    totalBookings,
    upcomingBookings,
    reviewCount,
    totalSpent: totalSpentResult._sum.amount ?? 0,
    bookingStatusDistribution,
    recentBookings,
  };
};

// ─── Main Dispatcher ──────────────────────────────────────────────────────────

const getDashboardStatsData = async (user: IRequestUser) => {
  switch (user.role) {
    case Role.ADMIN:
      return getAdminStatsData();
    case Role.CUSTOMER:
      return getCustomerStatsData(user);
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role!");
  }
};

export const StatsService = {
  getDashboardStatsData,
};