import { Prisma } from "../../generated/prisma/client.js";

import { fromTransactionTypeEnum } from "../../common/utils/domain.js";

export const dateStringPattern = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateString(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(value.toString());
}

type RelatedUser = {
  id: string;
  name: string;
  email: string;
};

type RecordForResponse = {
  id: string;
  amount: Prisma.Decimal | number;
  type: string;
  note: string | null;
  transactionDate: Date;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
  };
  createdBy?: RelatedUser;
  updatedBy?: RelatedUser;
};

export function serializeRecord(record: RecordForResponse) {
  return {
    id: record.id,
    amount: toNumber(record.amount),
    type: fromTransactionTypeEnum(record.type),
    category: record.category.name,
    categoryId: record.category.id,
    note: record.note,
    transactionDate: formatDateOnly(record.transactionDate),
    isDeleted: record.isDeleted,
    deletedAt: record.deletedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null
  };
}
