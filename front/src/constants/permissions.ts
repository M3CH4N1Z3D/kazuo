export const PERMISSIONS = {
  MANAGE_STORES: "manage_stores",
  MANAGE_PRODUCTS: "manage_products",
  MANAGE_INVENTORY: "manage_inventory",
  VIEW_STATISTICS: "view_statistics",
  MANAGE_PROVIDERS: "manage_providers",
};

export const PERMISSION_LABELS = {
  [PERMISSIONS.MANAGE_STORES]: "Gestionar Tiendas",
  [PERMISSIONS.MANAGE_PRODUCTS]: "Gestionar Productos",
  [PERMISSIONS.MANAGE_INVENTORY]: "Gestionar Inventario",
  [PERMISSIONS.VIEW_STATISTICS]: "Ver Estadísticas",
  [PERMISSIONS.MANAGE_PROVIDERS]: "Gestionar Proveedores",
};

export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.MANAGE_STORES]:
    "Puede crear, editar y eliminar tiendas. No permite gestionar productos ni inventario directamente.",
  [PERMISSIONS.MANAGE_PRODUCTS]:
    "Puede crear, editar y eliminar productos. No permite modificar el stock actual ni gestionar tiendas.",
  [PERMISSIONS.MANAGE_INVENTORY]:
    "Puede actualizar cantidades de stock y movimientos. No permite crear ni editar la información base de productos.",
  [PERMISSIONS.VIEW_STATISTICS]:
    "Puede visualizar reportes, gráficas de ventas y rendimiento. No permite realizar modificaciones en los datos.",
  [PERMISSIONS.MANAGE_PROVIDERS]:
    "Puede agregar, editar y eliminar información de proveedores. No otorga acceso a la gestión de inventario o ventas.",
};
