import { createAuditLog } from "../../common/audit/audit.repository.js";
import type { DbClient } from "../../common/audit/audit.shared.js";
import { AppError } from "../../common/errors/app-error.js";
import { buildPaginationMeta } from "../../common/utils/pagination.js";
import {
  type TransactionTypeInput
} from "../../common/utils/domain.js";
import { prisma } from "../../config/prisma.js";
import { serializeRecord } from "./records.shared.js";
import * as recordsRepository from "./records.repository.js";

type ListRecordsInput = {
  page: number;
  limit: number;
  from?: string;
  to?: string;
  type?: TransactionTypeInput;
  category?: string;
  search?: string;
  sortBy: "transactionDate" | "amount" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
};

type CreateRecordInput = {
  amount: number;
  type: TransactionTypeInput;
  category: string;
  note?: string | null;
  transactionDate: string;
  userId: string;
};

type UpdateRecordInput = {
  id: string;
  amount?: number;
  type?: TransactionTypeInput;
  category?: string;
  note?: string | null;
  transactionDate?: string;
  userId: string;
};

async function getRecordOrThrow(id: string, db?: DbClient) {
  const record = await recordsRepository.findRecordById(id, db);

  if (!record) {
    throw new AppError(404, "Record not found", "RECORD_NOT_FOUND");
  }

  return record;
}

export async function listRecords(input: ListRecordsInput) {
  const result = await recordsRepository.findRecords(input);

  return {
    items: result.items.map(serializeRecord),
    pagination: buildPaginationMeta(input.page, input.limit, result.total)
  };
}

export async function getRecordById(id: string) {
  const record = await getRecordOrThrow(id);

  return serializeRecord(record);
}

export async function createRecord(input: CreateRecordInput) {
  return prisma.$transaction(async (tx) => {
    const record = await recordsRepository.createRecord({
      amount: input.amount,
      type: input.type,
      category: input.category.trim(),
      note: input.note?.trim() || null,
      transactionDate: input.transactionDate,
      createdById: input.userId,
      updatedById: input.userId
    }, tx);
    const serializedRecord = serializeRecord(record);

    await createAuditLog({
      actorUserId: input.userId,
      action: "FINANCIAL_RECORD_CREATED",
      entityType: "financial_record",
      entityId: record.id,
      afterData: serializedRecord
    }, tx);

    return serializedRecord;
  });
}

export async function updateRecord(input: UpdateRecordInput) {
  return prisma.$transaction(async (tx) => {
    const existingRecord = await getRecordOrThrow(input.id, tx);
    const updatedRecord = await recordsRepository.updateRecord({
      id: input.id,
      amount: input.amount,
      type: input.type,
      category: input.category?.trim(),
      note: input.note?.trim() || null,
      transactionDate: input.transactionDate,
      updatedById: input.userId
    }, tx);
    const changedFields = [
      input.amount !== undefined ? "amount" : null,
      input.type !== undefined ? "type" : null,
      input.category !== undefined ? "category" : null,
      input.note !== undefined ? "note" : null,
      input.transactionDate !== undefined ? "transactionDate" : null
    ].filter((value): value is string => value !== null);
    const beforeData = serializeRecord(existingRecord);
    const afterData = {
      ...serializeRecord(updatedRecord),
      changedFields
    };

    await createAuditLog({
      actorUserId: input.userId,
      action: "FINANCIAL_RECORD_UPDATED",
      entityType: "financial_record",
      entityId: updatedRecord.id,
      beforeData,
      afterData
    }, tx);

    return serializeRecord(updatedRecord);
  });
}

export async function deleteRecord(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existingRecord = await getRecordOrThrow(id, tx);
    const deletedRecord = await recordsRepository.softDeleteRecord(id, userId, tx);
    const beforeData = serializeRecord(existingRecord);
    const afterData = serializeRecord(deletedRecord);

    await createAuditLog({
      actorUserId: userId,
      action: "FINANCIAL_RECORD_DELETED",
      entityType: "financial_record",
      entityId: deletedRecord.id,
      beforeData,
      afterData
    }, tx);

    return afterData;
  });
}
