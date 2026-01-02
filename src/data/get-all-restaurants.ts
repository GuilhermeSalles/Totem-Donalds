import { db } from "@/lib/prisma";

export async function getAllRestaurants() {
  return db.restaurant.findMany({
    orderBy: { name: "asc" },
  });
}
