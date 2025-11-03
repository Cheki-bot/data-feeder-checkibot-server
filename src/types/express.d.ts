import 'express';
import { Db } from 'mongodb';

declare global {
  namespace Express {
    interface Application {
      locals: {
        db: Db;
      };
    }
  }
}
