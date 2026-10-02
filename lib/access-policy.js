/** @param {{role:'ADMIN'|'SALES_MANAGER'|'SALES_AGENT',teamId:string|null,id:string}} user @param {{teamId?:string|null,assigneeId?:string|null}} record */
export function canAccessRecord(user, record) {
  if (user.role === "ADMIN") return true;
  if (user.role === "SALES_MANAGER") return Boolean(user.teamId && record.teamId === user.teamId);
  return record.assigneeId === user.id;
}
/** @param {{role:string,status:string}} target @param {{role?:string,status?:string}} change @param {number} activeAdminCount */
export function wouldRemoveLastActiveAdmin(target, change, activeAdminCount) {
  return target.role === "ADMIN" && target.status === "ACTIVE" && activeAdminCount <= 1 && ((change.role !== undefined && change.role !== "ADMIN") || (change.status !== undefined && change.status !== "ACTIVE"));
}
