import { Prisma } from '@prisma/client';

export type BoardFindOneReturnType = Prisma.BoardGetPayload<{
  include: {
    columns: {
      include: {
        tasks: true;
      };
    };
  };
}>;
