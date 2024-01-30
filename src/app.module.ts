import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { NonconformingProductModule } from './nonconforming-product/nonconforming-product.module';
import { ConfigModule } from '@nestjs/config';
import { TypeormService } from './typeorm/typeorm.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeormService,
      imports: [ConfigModule.forRoot()],
    }),
    UserModule,
    NonconformingProductModule,
  ],
})
export class AppModule {}
