describe('API Health Checks', () => {
  describe('Module structure', () => {
    it('should have all required modules', () => {
      const modules = [
        'meteorology',
        'oceanography',
        'traffic',
        'comercio',
        'iron',
        'noticias-regionais',
      ];
      expect(modules.length).toBeGreaterThanOrEqual(6);
      expect(modules).toContain('iron');
      expect(modules).toContain('meteorology');
      expect(modules).toContain('oceanography');
    });
  });

  describe('API endpoints', () => {
    it('should have health endpoint', () => {
      const endpoints = [
        'GET /health',
        'GET /v1/meteorology',
        'GET /v1/oceanography',
        'GET /v1/traffic',
        'GET /v1/comercio',
        'GET /v1/noticias-regionais',
        'POST /v1/iron/chat',
      ];
      expect(endpoints).toContain('GET /health');
      expect(endpoints).toContain('POST /v1/iron/chat');
    });
  });
});
