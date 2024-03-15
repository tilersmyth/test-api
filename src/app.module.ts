import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiModule } from './api/api.module';
import { TypeormService } from './typeorm/typeorm.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeormService,
      imports: [ConfigModule.forRoot()],
    }),
    ApiModule,
  ],
})
export class AppModule {}
