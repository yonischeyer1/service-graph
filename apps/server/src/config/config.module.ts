import { Module } from '@nestjs/common';
import { ENV, envSchema } from './env';

@Module({
  providers: [
    {
      provide: ENV,
      useFactory: () => envSchema.parse(process.env),
    },
  ],
  exports: [ENV],
})
export class ConfigModule {}
