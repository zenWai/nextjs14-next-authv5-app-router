import { db } from '@/lib/db';

export const deleteCustomVerificationTokenById = async (tokenId: string): Promise<void> => {
  await db.customVerificationToken.delete({
    where: { id: tokenId },
  });
};
