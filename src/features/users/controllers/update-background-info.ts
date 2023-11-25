import { joiValidation } from '@global/decorators/joi.validation';
import { userQueue } from '@service/queues/user.queue';
import { UserCache } from '@service/redis/user.cache';
import { backgroundInfoSchema } from '@user/schemes/user.scheme';
import { Request, Response } from 'express';
import STATUS_CODE from 'http-status-codes';

const userCache: UserCache = new UserCache();
export class BackgroundInformation {
  @joiValidation(backgroundInfoSchema)
  public async user(req: Request, res: Response): Promise<void> {
    for (const [key, value] of Object.entries(req.body)) {
      await userCache.updateSingleItemInCache(req.currentUser!.userId, key, `${value}`);
    }
    userQueue.addUserJob('updateBackgroundInformation', {
      key: req.currentUser!.userId,
      value: req.body
    });
    res.status(STATUS_CODE.OK).json({ message: 'user background information has been updated!' });
  }
}
