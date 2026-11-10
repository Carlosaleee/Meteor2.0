import { describe, it, expect } from 'vitest';
import { fmt } from './format';
import { common } from './dictionaries/common';
import { home } from './dictionaries/home';
import { meteorologia } from './dictionaries/meteorologia';
import { swell } from './dictionaries/swell';
import { noticias } from './dictionaries/noticias';
import { comercio } from './dictionaries/comercio';
import { blog } from './dictionaries/blog';
import { creditos } from './dictionaries/creditos';

const DICTIONARIES = { common, home, meteorologia, swell, noticias, comercio, blog, creditos };

describe('fmt', () => {
  it('substitui as variaveis entre chaves', () => {
    expect(fmt('Slide {i} de {n}', { i: 1, n: 5 })).toBe('Slide 1 de 5');
    expect(fmt('máx {max}° · mín {min}°', { max: 28, min: 19 })).toBe('máx 28° · mín 19°');
  });

  it('substitui varias variaveis na mesma string', () => {
    expect(fmt('{a} e {b} em {c}', { a: 'um', b: 'dois', c: 'tres' })).toBe('um e dois em tres');
  });

  it('deixa a variavel intacta quando o valor nao foi informado', () => {
    expect(fmt('Abrir {name}', {})).toBe('Abrir ');
  });

  it('devolve string vazia para entrada indefinida', () => {
    expect(fmt(undefined, { a: 1 })).toBe('');
    expect(fmt('', { a: 1 })).toBe('');
  });

  it('ignora chaves desconhecidas na string', () => {
    expect(fmt('texto sem variavel', { a: 1 })).toBe('texto sem variavel');
  });
});

describe('dicionarios — paridade entre idiomas', () => {
  for (const [name, dict] of Object.entries(DICTIONARIES)) {
    it(`${name} tem as mesmas chaves em pt e es`, () => {
      const ptKeys = Object.keys(dict.pt).sort();
      const esKeys = Object.keys(dict.es).sort();
      expect(esKeys).toEqual(ptKeys);
    });

    it(`${name} nao tem valores vazios`, () => {
      for (const [lang, entries] of Object.entries(dict)) {
        for (const [key, value] of Object.entries(entries)) {
          expect(value, `${name}.${lang}.${key} esta vazio`).not.toBe('');
        }
      }
    });
  }
});

describe('dicionarios — cobertura das chaves usadas', () => {
  it('home cobre as secoes, CTAs e a11y da capa', () => {
    for (const key of [
      'main.aria', 'main.h1', 'skip.content',
      'section.weather', 'section.traffic', 'section.news', 'section.sea',
      'section.sport', 'section.blog', 'section.comercio', 'section.points',
      'cta.weather', 'cta.viewAll', 'cta.map',
      'aria.weather', 'aria.cityList', 'aria.newsFilter',
      'a11y.blog.open', 'a11y.spot.maps', 'a11y.route.open',
      'hero.slideOf', 'hero.goToSlide', 'hero.announce',
    ]) {
      expect(home.pt[key], `home.pt.${key} ausente`).toBeTruthy();
      expect(home.es[key], `home.es.${key} ausente`).toBeTruthy();
    }
  });

  it('home usa placeholders coerentes com as chamadas de fmt', () => {
    expect(home.pt['city.maxMin']).toContain('{max}');
    expect(home.pt['city.maxMin']).toContain('{min}');
    expect(home.pt['source.lastUpdate']).toContain('{date}');
    expect(home.pt['hero.slideOf']).toContain('{i}');
    expect(home.pt['hero.slideOf']).toContain('{n}');
    expect(home.pt['hero.slideOf']).toContain('{title}');
    expect(home.pt['a11y.spot.maps']).toContain('{name}');
  });

  it('os demais dicionarios cobrem titulo, subtitulo e a11y da rota', () => {
    for (const dict of [meteorologia, swell, noticias, comercio, blog, creditos]) {
      expect(dict.pt['page.title'], 'page.title ausente').toBeTruthy();
      expect(dict.pt['page.subtitle'], 'page.subtitle ausente').toBeTruthy();
      expect(dict.es['page.title'], 'page.title (es) ausente').toBeTruthy();
    }
  });
});
