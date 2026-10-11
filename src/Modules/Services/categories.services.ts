import { AppDataSource } from "../../Config/database"; 
import { Categories } from "../../Entities/Categories";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-");

export class CategoryService {
  private repo = AppDataSource.getRepository(Categories);

  async getAll() {
    return this.repo.find({ order: { name: "ASC" } });
  }

  async create(name: string) {
    const slug = slugify(name);

    const existing = await this.repo
      .createQueryBuilder("c")
      .where("LOWER(c.name) = LOWER(:name)", { name })
      .getOne();
    if (existing) return existing;

    const category = this.repo.create({ name: name.trim(), slug });
    return this.repo.save(category);
  }
}