import { Module } from '@nestjs/common';
import { NonconformingProductService } from './nonconforming-product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NonconformingProductController } from './nonconforming-product.controller';
import { NonConformingProductEntity } from 'src/entities/nonconforming-product.entity';
import { NonConformingProductGroupEntity } from 'src/entities/nonconforming-product-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NonConformingProductEntity,
      NonConformingProductGroupEntity,
    ]),
  ],
  controllers: [NonconformingProductController],
  providers: [NonconformingProductService],
})
export class NonconformingProductModule {}
