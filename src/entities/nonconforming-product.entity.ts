import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { NonConformingProductGroupEntity } from './nonconforming-product-group.entity';

export enum NonconformingProductGroupEnum {
  BATCH = 'batch',
  SINGLE = 'single',
}

@Entity('nonconforming_products')
export class NonConformingProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'float' })
  weight: string;

  @Column({ nullable: false })
  protein_group_id: string;

  @Column({ type: 'integer' })
  processor_id: number;

  @Column({ type: 'varchar', length: 12 })
  lot_number: string;

  @Column({ type: 'varchar', length: 5 })
  vistatrac_sku: string;

  @Column({ type: 'integer' })
  reason: number;

  @Column({ type: 'enum', enum: NonconformingProductGroupEnum })
  scan_type: NonconformingProductGroupEnum;

  @Column({ type: 'integer' })
  operator_id: number;

  @Column('timestamp')
  created_at: Date;

  @ManyToOne(() => NonConformingProductGroupEntity)
  @JoinColumn({ name: 'protein_group_id' })
  protein_group: NonConformingProductGroupEntity;
}
