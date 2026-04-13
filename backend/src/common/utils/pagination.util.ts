/**
 * Returns paginated response shape with metadata.
 */
export function paginate<T>(data: T[], total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      totalCount: total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Calculates skip and take for Prisma pagination.
 */
export function getPaginationOptions(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}
