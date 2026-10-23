export function isMigrationFile(path) {
  return path.endsWith(".sql");
}
export function pendingMigrations() {
  return [];
}
