# Plan for Adjusting Gemini and RAG Limits

## Objectives
- **Reduzir a latência do chat** e evitar timeouts prolongados.
- **Manter o uso de tokens dentro dos limites do Gemini**.
- **Minimizar a sobrecarga do RAG** enquanto mantém a utilidade da informação recuperada.

## Proposed Changes

### Gemini (Chat \u0026 Rich‑Text)
| Parameter | Current | Proposed | Reason |
|-----------|---------|----------|--------|
| `timeout` | 60s | **45s** | Falha pode ocorrer mais cedo e acionamos fallback mais rápido. |
| Max response tokens | 2000 | **1500** | Resposta mais concisa, redução de custo de tokens. |
| Prompt context length | ~350 tokens + 5 chunks (≈200kB) | **≈180 tokens + ≤3 chunks** | Reserva espaço de token para o prompt real do Gemini. |
| Concurrency control | None | **Semaphore/Single‑flight** max 10 concurrent calls | Evita saturação de chamadas ao Gemini. |
| Timeout fallback | Erro genérico | Mensagem curta “Desculpe, não pude concluir a solicitação.” | UX consistente e informativo. |

### RAG (Hybrid)
| Parameter | Current | Proposed | Reason |
|-----------|---------|----------|--------|
| `maxChunksPerQuery` | 5 | **3** | Reduz custo de embeddings e tamanho total do prompt. |
| `maxChunkSizeKB` | 32KB | **24KB** | Mantém payload pequeno, evita exceder limites de token. |
| Re‑index frequency | After `refreshAll()` | **Fast in‑memory rebuild** (sem write I/O) | Aproxima menor latência. |
| Cache | Single‑flight only | **LRU cache** TTL 5 min | Evita chamadas repetidas para o mesmo prompt. |
| Fallback | No chunk → return `ragHits:0` | **Omit RAG sections** | Clareza da resposta que nada foi recuperado. |

## Implementation Steps
1. **GeminiClientService** – Use `AbortController` com 45s timeout.
2. **GeminiChatRepository** – Ajustar limite de tokens, incluir fallback de timeout, torná‑o mais testável.
3. **RagService** – Alterar parâmetros `maxChunksPerQuery`, `maxChunkSizeKB`; implementar cache LRU.
4. **IronService** – Injectar `GeminiContextBuilder`, usar `contextBuilder.buildContext(history)`; envolver chamadas Gemini com timeout e fallback.
5. **Tests** – Criar testes unitários que mock Gemini e RAG, assegurando timeout, limites de tokens e cache.
6. **Monitoring** – Logar latências, contagem de hits de RAG e métricas de falhas.
7. **Docs** – Atualizar README/API para refletir novos limites e comportamento de fallback.

---

## Expected Impact
- **Chat retorno médio < 1s** (com probabilidade de 95%).
- **Token budget** reduzido, custo de uso do Gemini diminui.
- **Solução mais robusta** frente a falhas de rede ou rate‑limits.
- **UX mais coerente** com mensagens de erro curtas.

---

## Risks & Mitigations
- Timeout prematuro → Enfim 45s pode ser insuficiente em picos. **Mitigação**: monitorar métricas e ajustar se necessário.
- Cache stale → Dados do RAG podem ficar obsoletos. **Mitigação**: TTL 5 min + refresh manual via cron.
- Conteúdo inesperado → Contexto pode crescer acima do previsto. **Mitigação**: checar tamanho do string antes de enviar, truncar se necessário.

---

## Deliverables
- Código refatorado (GeminiClientService, GeminiChatRepository, RagService, IronService).
- Testes unitários e de integração.
- Documentação atualizada.
- Métricas adicionadas ao sistema de monitoramento.

---

**Projeto:** Meteor 2.0 | **Data:** 2026‑10‑20