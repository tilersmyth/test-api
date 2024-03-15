import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NonConformingProductGroupEntity } from '../../entities/nonconforming-product-group.entity';
import {
  NonConformingProductEntity,
  NonconformingProductGroupEnum,
} from '../../entities/nonconforming-product.entity';

import { CreateNonconformingProductDto } from './dto/create-ncp-product';

@Injectable()
export class NonconformingProductService {
  constructor(
    @InjectRepository(NonConformingProductEntity)
    private productRepo: Repository<NonConformingProductEntity>,
    @InjectRepository(NonConformingProductGroupEntity)
    private groupRepo: Repository<NonConformingProductGroupEntity>,
  ) {}

  public async create(
    product: CreateNonconformingProductDto,
  ): Promise<NonConformingProductEntity> {
    const group = await this.groupRepo.findOne({
      where: { id: product.protein_group },
    });

    if (!group) {
      throw Error(`Failed to find group: ${product.protein_group}`);
    }

    const ncp_product = new NonConformingProductEntity();
    ncp_product.protein_group = group;
    ncp_product.scan_type = NonconformingProductGroupEnum.BATCH;
    ncp_product.operator_id = product.operator_id;
    ncp_product.weight = product.weight;

    return this.productRepo.save(ncp_product);
  }

  public async findGroups() {
    return this.groupRepo.find();
  }
}
