import { Injectable } from "@nestjs/common";
import { PortalRepository } from "./portal.repository";
import type { PortalQueryDto } from "./dto/portal-query.dto";

@Injectable()
export class PortalService {
  constructor(private readonly repo: PortalRepository) {}

  async listNoticias(query: PortalQueryDto): Promise<{ data: unknown[]; total: number; page: number; limit: number }> {
    const { data, total } = await this.repo.list(query);
    return { data, total, page: query.page, limit: query.limit };
  }

  async getBySlug(slug: string): Promise<unknown | null> {
    return this.repo.getBySlug(slug);
  }
}
