import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";
import type { DbClient } from "./audit.shared.js";

type CreateAuditLogInput = {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeData?: unknown;
  afterData?: unknown;
};

export async function createAuditLog(input: CreateAuditLogInput, db: DbClient = prisma) {
  return db.auditLog.create({
    data: {
      actor: {
        connect: {
          id: input.actorUserId
        }
      },
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      beforeData: input.beforeData === undefined ? undefined : (input.beforeData as Prisma.InputJsonValue),
      afterData: input.afterData === undefined ? undefined : (input.afterData as Prisma.InputJsonValue)
    }
  });
}
