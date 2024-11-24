import { revalidateTag } from 'next/cache';

export const clearUnstableCachedInfoForJwtByUserId = async (userId: string) => {
  revalidateTag(`jwt-info-tag-${userId}`);
};
