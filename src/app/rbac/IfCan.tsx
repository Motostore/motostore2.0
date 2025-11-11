import IfCan from "../rbac/IfCan";

// "Admin"
<IfCan action="products:write">
  <Link href="/dashboard/admin/products">Productos</Link>
</IfCan>

<IfCan action="users:create">
  <Link href="/dashboard/admin/users">Usuarios</Link>
</IfCan>

<IfCan action="transactions:read:any">
  <Link href="/dashboard/admin/transactions">Transacciones globales</Link>
</IfCan>
