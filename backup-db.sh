#!/bin/bash
# OvoSfera — Automatic PostgreSQL backup
# Run via cron: 0 3 * * * /srv/docker/apps/ovosfera-hub/backup-db.sh
#
# Keeps last 30 daily backups automatically.

set -euo pipefail

BACKUP_DIR="/srv/docker/apps/ovosfera-hub/backups"
CONTAINER="ovosfera-db"
DB_NAME="ovosfera"
DB_USER="ovosfera_user"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="ovosfera_${TIMESTAMP}.sql.gz"

# Dump and compress
docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "${BACKUP_DIR}/${FILENAME}"

# Remove backups older than retention period
find "$BACKUP_DIR" -name "ovosfera_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup OK: ${FILENAME} ($(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1))"
