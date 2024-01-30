import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('nonconforming_product_groups')
export class NonConformingProductGroupEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  name: string;
}
