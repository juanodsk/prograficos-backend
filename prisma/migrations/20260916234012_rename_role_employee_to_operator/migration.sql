-- Renombra el valor del enum Role: EMPLOYEE -> OPERATOR (preserva filas existentes)
ALTER TYPE "Role" RENAME VALUE 'EMPLOYEE' TO 'OPERATOR';
