import { db } from '@/lib/db';

export const deletePasswordResetTokenById = async (tokenId: string): Promise<void> => {
  await db.passwordResetToken.delete({
    where: { id: tokenId },
  });
};
