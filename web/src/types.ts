export type Role = "admin" | "staff";

export type MenuItem = {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  priceCents: number;
  imageUrl?: string;
  isAvailable: boolean;
};

export type OrderStatus = "NEW" | "IN_PROGRESS" | "READY" | "COMPLETED" | "CANCELLED";

export type OrderItem = {
  menuItemId: string;
  name: string;
  priceCents: number;
  qty: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  table: string;
  notes: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: string;
  user: { email: string; role: Role };
};
