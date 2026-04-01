import { AppError } from "../../common/errors/app-error.js";
import { buildPaginationMeta } from "../../common/utils/pagination.js";
import {
  type TransactionTypeInput
} from "../../common/utils/domain.js";
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

async function getRecordOrThrow(id: string) {
  const record = await recordsRepository.findRecordById(id);

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
  const record = await recordsRepository.createRecord({
    amount: input.amount,
    type: input.type,
    category: input.category.trim(),
    note: input.note?.trim() || null,
    transactionDate: input.transactionDate,
    createdById: input.userId,
    updatedById: input.userId
  });

  return serializeRecord(record);
}

export async function updateRecord(input: UpdateRecordInput) {
  await getRecordOrThrow(input.id);

  const updatedRecord = await recordsRepository.updateRecord({
    id: input.id,
    amount: input.amount,
    type: input.type,
    category: input.category?.trim(),
    note: input.note?.trim() || null,
    transactionDate: input.transactionDate,
    updatedById: input.userId
  });

  return serializeRecord(updatedRecord);
}

export async function deleteRecord(id: string, userId: string) {
  await getRecordOrThrow(id);

  const deletedRecord = await recordsRepository.softDeleteRecord(id, userId);

  return serializeRecord(deletedRecord);
}
