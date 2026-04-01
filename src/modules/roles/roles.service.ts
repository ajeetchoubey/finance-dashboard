import { ROLE_PERMISSIONS } from "../../common/constants/permissions.js";
import { fromRoleEnum } from "../../common/utils/domain.js";
import * as rolesRepository from "./roles.repository.js";

export async function listRoles() {
  const roles = await rolesRepository.findRoles();

  return roles.map((role) => {
    const name = fromRoleEnum(role.name);

    return {
      id: role.id,
      name,
      description: role.description,
      permissions: ROLE_PERMISSIONS[name],
      userCount: role._count.users,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString()
    };
  });
}
