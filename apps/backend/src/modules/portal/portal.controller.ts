import { Controller, Get, Param, Query } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/http/zod-validation.pipe";
import { portalQuerySchema, type PortalQueryDto } from "./dto/portal-query.dto";
import { PortalService } from "./portal.service";

@Controller("v1/portal")
export class PortalController {
  constructor(private readonly portal: PortalService) {}

  @Get("noticias")
  async listNoticias(
    @Query(new ZodValidationPipe(portalQuerySchema)) query: PortalQueryDto,
  ): Promise<unknown> {
    return this.portal.listNoticias(query);
  }

  @Get("noticias/:slug")
  async getBySlug(@Param("slug") slug: string): Promise<unknown> {
    const noticia = await this.portal.getBySlug(slug);
    if (!noticia) return { success: false, data: null, error: { code: "NOT_FOUND", message: "Noticia not found" } };
    return noticia;
  }
}
