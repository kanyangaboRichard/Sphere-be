import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,OneToMany,} from "typeorm";
import { ShopProduct } from "../Entities/ShopProducts";

@Entity("shop_categories")
export class ShopCategory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  name: string;

  @Column({ type: "varchar", unique: true })
  slug: string;

  @Column({ type: "varchar", nullable: true })
  image: string;

  @Column({ type: "varchar", nullable: true })
  imagePublicId: string;

  @Column({ type: "int", default: 0 })
  order: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => ShopProduct, (product) => product.category)
  products: ShopProduct[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}