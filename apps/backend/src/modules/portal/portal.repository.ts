import { Injectable, Logger } from "@nestjs/common";

export type Noticia = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  body: string;
  source: string;
  publishedAt: string;
  region: string;
};

@Injectable()
export class PortalRepository {
  private readonly logger = new Logger(PortalRepository.name);
  private noticias: Noticia[] = [
    {
      id: 1,
      title: "Frente fria avança pelo Vale do Ribeira e mar fica agitado em Ilha Comprida",
      slug: "frente-fria-vale-ribeira-ilha-comprida",
      excerpt: "Vento sudoeste de 25 km/h e ondas de 1.8m marcam a virada do tempo no litoral sul paulista.",
      cover: "/CapaMeteor.jpg",
      body: "O avanço de uma frente fria pelo Vale do Ribeira eleva o swell para 1.8m em Ilha Comprida. Ventos de sudoeste mantêm o mar mexido, ideal para surfistas experientes. A previsão indica melhora gradual a partir de amanhã.",
      source: "g1",
      publishedAt: new Date().toISOString(),
      region: "vale-do-ribeira",
    },
    {
      id: 2,
      title: "Climatempo: tempo firme e calor retorna ao Vale após chuva rápida",
      slug: "climatempo-tempo-firme-vale",
      excerpt: "Massa de ar seco deixa o tempo aberto em Registro e Iguape, com máxima de 28°C.",
      cover: "/CapaMeteor.jpg",
      body: "Segundo o Climatempo, o Vale do Ribeira terá tempo firme nos próximos dias, com pancadas isoladas apenas no fim de tarde. O mar segue com ondas de 1m e período de 9s, bom para iniciantes.",
      source: "climmatempo",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      region: "vale-do-ribeira",
    },
    {
      id: 3,
      title: "G1 Vale: pesca artesanal lota a orla de Cananeia com mar calmo",
      slug: "g1-pesca-cananeia-mar-calmo",
      excerpt: "Mar calmo com ondas de 0.8m atrai pescadores e famílias para a orla de Cananeia.",
      cover: "/CapaMeteor.jpg",
      body: "Com o mar calmo e vento fraco de nordeste, a orla de Cananeia ficou lotada. Surfistas aguardam novo swell previsto para o fim de semana, com período de 11s.",
      source: "g1",
      publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      region: "ilha-comprida",
    },
  ];

  async list(query: { page: number; limit: number; source: string }): Promise<{ data: Noticia[]; total: number }> {
    let filtered = this.noticias;
    if (query.source !== "all") filtered = filtered.filter((n) => n.source === query.source);
    const total = filtered.length;
    const start = (query.page - 1) * query.limit;
    const data = filtered.slice(start, start + query.limit);
    return { data, total };
  }

  async getBySlug(slug: string): Promise<Noticia | null> {
    return this.noticias.find((n) => n.slug === slug) ?? null;
  }

  async allForRag(): Promise<Noticia[]> {
    return this.noticias;
  }
}
