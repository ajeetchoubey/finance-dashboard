import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";
import {
  toTransactionTypeEnum,
  type TransactionTypeInput
} from "../../common/utils/domain.js";
import { parseDateString } from "../records/records.shared.js";

type DashboardFilters = {
  from?: string;
  to?: string;
  type?: TransactionTypeInput;
};

const recentActivityInclude = {
  category: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  updatedBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} satisfies Prisma.FinancialRecordInclude;

function buildRecordWhere(filters: DashboardFilters): Prisma.FinancialRecordWhereInput {
  const where: Prisma.FinancialRecordWhereInput = {
    isDeleted: false
  };
  const transactionDateFilter: Prisma.DateTimeFilter<"FinancialRecord"> = {};

  if (filters.from) {
    transactionDateFilter.gte = parseDateString(filters.from);
  }

  if (filters.to) {
    transactionDateFilter.lte = parseDateString(filters.to);
  }

  if (filters.from || filters.to) {
    where.transactionDate = transactionDateFilter;
  }

  if (filters.type) {
    where.type = toTransactionTypeEnum(filters.type);
  }

  return where;
}

export async function getSummaryTotals(filters: DashboardFilters) {
  return prisma.financialRecord.groupBy({
    by: ["type"],
    where: buildRecordWhere(filters),
    _sum: {
      amount: true
    }
  });
}

export async function getCategoryTotals(filters: DashboardFilters) {
  const grouped = await prisma.financialRecord.groupBy({
    by: ["categoryId", "type"],
    where: buildRecordWhere(filters),
    _sum: {
      amount: true
    },
    _count: {
      _all: true
    }
  });
  const categoryIds = [...new Set(grouped.map((entry) => entry.categoryId))];
  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: categoryIds
      }
    }
  });

  return {
    grouped,
    categories
  };
}

export async function getTrendRecords(filters: DashboardFilters) {
  return prisma.financialRecord.findMany({
    where: buildRecordWhere(filters),
    orderBy: {
      transactionDate: "asc"
    },
    select: {
      amount: true,
      type: true,
      transactionDate: true
    }
  });
}

export async function getRecentActivity(input: DashboardFilters & { limit: number }) {
  return prisma.financialRecord.findMany({
    where: buildRecordWhere(input),
    take: input.limit,
    orderBy: [
      {
        transactionDate: "desc"
      },
      {
        updatedAt: "desc"
      }
    ],
    include: recentActivityInclude
  });
}
