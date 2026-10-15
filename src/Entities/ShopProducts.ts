import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,ManyToOne,JoinColumn,} from "typeorm";
import { ShopCategory } from "../Entities/ShopCategories";

@Entity("shop_products")
export class ShopProduct {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", nullable: true })
  image: string;

  @Column({ type: "varchar", nullable: true })
  imagePublicId: string;

  // Free-text quantity label shown under the name, e.g. "1000gm", "4pc", "1.5kg"
  @Column({ type: "varchar", nullable: true })
  unit: string;

  @Column({ type: "float" })
  price: number;

  // Set only when the item is discounted, to render the strikethrough original price
  @Column({ type: "float", nullable: true })
  originalPrice: number | null;

  // Free-text tag shown on the image corner, e.g. "Best Sale", "20% OFF", "Organic", "Frozen", "New"
  @Column({ type: "varchar", nullable: true })
  badge: string | null;

  @Column({ type: "boolean", default: false })
  isNewArrival: boolean;

  @Column({ type: "boolean", default: false })
  isDeal: boolean;

  @Column({ type: "int", default: 0 })
  order: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  // External link the product tile sends visitors to (your actual store, WhatsApp, etc.)
  @Column({ type: "varchar", nullable: true })
  link: string | null;

  @Column({ type: "uuid", nullable: true })
  categoryId: string | null;

  @ManyToOne(() => ShopCategory, (category) => category.products, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "categoryId" })
  category: ShopCategory;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}