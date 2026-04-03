import { Prisma } from "../../generated/prisma/client.js";

import type { DbClient } from "../../common/audit/audit.shared.js";
import { prisma } from "../../config/prisma.js";
import {
  toTransactionTypeEnum,
  type TransactionTypeInput
} from "../../common/utils/domain.js";
import { parseDateString } from "./records.shared.js";

type RecordFilters = {
  from?: string;
  to?: string;
  type?: TransactionTypeInput;
  category?: string;
  search?: string;
};

type ListRecordsInput = RecordFilters & {
  page: number;
  limit: number;
  sortBy: "transactionDate" | "amount" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
};

type CreateRecordInput = {
  amount: number;
  type: TransactionTypeInput;
  category: string;
  note?: string | null;
  transactionDate: string;
  createdById: string;
  updatedById: string;
};

type UpdateRecordInput = {
  id: string;
  amount?: number;
  type?: TransactionTypeInput;
  category?: string;
  note?: string | null;
  transactionDate?: string;
  updatedById: string;
};

const recordInclude = {
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

function buildRecordWhere(filters: RecordFilters): Prisma.FinancialRecordWhereInput {
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

  if (filters.category) {
    where.category = {
      name: {
        contains: filters.category.trim(),
        mode: "insensitive"
      }
    };
  }

  if (filters.search) {
    where.OR = [
      {
        note: {
          contains: filters.search.trim(),
          mode: "insensitive"
        }
      },
      {
        category: {
          name: {
            contains: filters.search.trim(),
            mode: "insensitive"
          }
        }
      },
      {
        createdBy: {
          name: {
            contains: filters.search.trim(),
            mode: "insensitive"
          }
        }
      }
    ];
  }

  return where;
}

async function upsertCategory(name: string, db: DbClient = prisma) {
  return db.category.upsert({
    where: { name: name.trim() },
    update: {},
    create: { name: name.trim() }
  });
}

export async function findRecordById(id: string, db: DbClient = prisma) {
  return db.financialRecord.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: recordInclude
  });
}

export async function findRecords(input: ListRecordsInput) {
  const where = buildRecordWhere(input);
  const skip = (input.page - 1) * input.limit;
  const orderBy = {
    [input.sortBy]: input.sortOrder
  } as Prisma.FinancialRecordOrderByWithRelationInput;
  const [items, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      skip,
      take: input.limit,
      orderBy,
      include: recordInclude
    }),
    prisma.financialRecord.count({ where })
  ]);

  return {
    items,
    total
  };
}

export async function createRecord(input: CreateRecordInput, db: DbClient = prisma) {
  const category = await upsertCategory(input.category, db);

  return db.financialRecord.create({
    data: {
      amount: new Prisma.Decimal(input.amount),
      type: toTransactionTypeEnum(input.type),
      categoryId: category.id,
      note: input.note ?? null,
      transactionDate: parseDateString(input.transactionDate),
      createdById: input.createdById,
      updatedById: input.updatedById
    },
    include: recordInclude
  });
}

export async function updateRecord(input: UpdateRecordInput, db: DbClient = prisma) {
  const data: Prisma.FinancialRecordUpdateInput = {
    updatedBy: {
      connect: {
        id: input.updatedById
      }
    }
  };

  if (input.amount !== undefined) {
    data.amount = new Prisma.Decimal(input.amount);
  }

  if (input.type !== undefined) {
    data.type = toTransactionTypeEnum(input.type);
  }

  if (input.category !== undefined) {
    const category = await upsertCategory(input.category, db);

    data.category = {
      connect: {
        id: category.id
      }
    };
  }

  if (input.note !== undefined) {
    data.note = input.note;
  }

  if (input.transactionDate !== undefined) {
    data.transactionDate = parseDateString(input.transactionDate);
  }

  return db.financialRecord.update({
    where: { id: input.id },
    data,
    include: recordInclude
  });
}

export async function softDeleteRecord(id: string, updatedById: string, db: DbClient = prisma) {
  return db.financialRecord.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      updatedById
    },
    include: recordInclude
  });
}
