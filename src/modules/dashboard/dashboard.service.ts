import { formatDateOnly, serializeRecord, toNumber } from "../records/records.shared.js";
import * as dashboardRepository from "./dashboard.repository.js";
import { type TransactionTypeInput } from "../../common/utils/domain.js";

type DashboardFilters = {
  from?: string;
  to?: string;
  type?: TransactionTypeInput;
};

type TrendInput = DashboardFilters & {
  period: "daily" | "weekly" | "monthly";
};

function startOfWeekUtc(value: Date) {
  const date = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

function endOfWeekUtc(value: Date) {
  const end = new Date(value);
  end.setUTCDate(end.getUTCDate() + 6);
  return end;
}

function startOfMonthUtc(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));
}

function endOfMonthUtc(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0));
}

export async function getSummary(filters: DashboardFilters) {
  const totals = await dashboardRepository.getSummaryTotals(filters);
  const incomeEntry = totals.find((entry) => entry.type === "INCOME");
  const expenseEntry = totals.find((entry) => entry.type === "EXPENSE");
  const totalIncome = toNumber(incomeEntry?._sum.amount);
  const totalExpense = toNumber(expenseEntry?._sum.amount);

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense
  };
}

export async function getCategoryTotals(filters: DashboardFilters) {
  const { grouped, categories } = await dashboardRepository.getCategoryTotals(filters);
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const totalsByCategory = new Map<
    string,
    {
      categoryId: string;
      category: string;
      totalIncome: number;
      totalExpense: number;
      netBalance: number;
      recordCount: number;
    }
  >();

  for (const entry of grouped) {
    const existing = totalsByCategory.get(entry.categoryId) ?? {
      categoryId: entry.categoryId,
      category: categoryMap.get(entry.categoryId) ?? "Unknown",
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      recordCount: 0
    };
    const amount = toNumber(entry._sum.amount);

    if (entry.type === "INCOME") {
      existing.totalIncome += amount;
    } else {
      existing.totalExpense += amount;
    }

    existing.recordCount += entry._count._all;
    existing.netBalance = existing.totalIncome - existing.totalExpense;
    totalsByCategory.set(entry.categoryId, existing);
  }

  return Array.from(totalsByCategory.values()).sort((left, right) => right.netBalance - left.netBalance);
}

export async function getTrends(input: TrendInput) {
  const records = await dashboardRepository.getTrendRecords(input);
  const grouped = new Map<
    string,
    {
      period: string;
      startDate: string;
      endDate: string;
      totalIncome: number;
      totalExpense: number;
      netBalance: number;
      recordCount: number;
    }
  >();

  for (const record of records) {
    const start =
      input.period === "daily"
        ? new Date(
            Date.UTC(
              record.transactionDate.getUTCFullYear(),
              record.transactionDate.getUTCMonth(),
              record.transactionDate.getUTCDate()
            )
          )
        : input.period === "weekly"
          ? startOfWeekUtc(record.transactionDate)
          : startOfMonthUtc(record.transactionDate);
    const end =
      input.period === "daily"
        ? start
        : input.period === "weekly"
          ? endOfWeekUtc(start)
          : endOfMonthUtc(start);
    const key = formatDateOnly(start);
    const existing = grouped.get(key) ?? {
      period: input.period,
      startDate: formatDateOnly(start),
      endDate: formatDateOnly(end),
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      recordCount: 0
    };
    const amount = toNumber(record.amount);

    if (record.type === "INCOME") {
      existing.totalIncome += amount;
    } else {
      existing.totalExpense += amount;
    }

    existing.recordCount += 1;
    existing.netBalance = existing.totalIncome - existing.totalExpense;
    grouped.set(key, existing);
  }

  return Array.from(grouped.values()).sort((left, right) => left.startDate.localeCompare(right.startDate));
}

export async function getRecentActivity(input: DashboardFilters & { limit: number }) {
  const records = await dashboardRepository.getRecentActivity(input);

  return records.map(serializeRecord);
}
