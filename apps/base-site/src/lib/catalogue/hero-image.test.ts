import { describe, expect, it } from 'vitest';

import { campusPhoto, commonsFilePage, isInstitutionMark } from './hero-image';

const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=1200`;

describe('isInstitutionMark', () => {
  it.each([
    'ATSU logo.svg',
    'KCLogo.png',
    'Seal of Harvard University.svg',
    'Coat of arms of Keele.png',
    'UNIA wordmark.SVG',
  ])('treats %s as a mark', (file) => {
    expect(isInstitutionMark(file)).toBe(true);
  });

  it.each([
    'Dartmouth College campus 2007-06-23 Dartmouth Hall 02.JPG',
    'Cranfield University entrance Main reception and logo.jpg',
    'Sanders theater 2009y.JPG',
    'Rectorado UNIA.jpg',
  ])('treats %s as a photograph', (file) => {
    expect(isInstitutionMark(file)).toBe(false);
  });
});

describe('campusPhoto', () => {
  it('drops a logo rather than cropping it across a banner', () => {
    // A.T. Still University: Wikidata's only image for it is the wordmark, and
    // object-cover turned it into a wall of cut-off letterforms.
    expect(campusPhoto(commons('ATSU%20logo.svg'))).toBeNull();
  });

  it('keeps a campus photograph', () => {
    const url = commons('Cardiff.jpg');
    expect(campusPhoto(url)).toBe(url);
  });

  it('keeps an image that did not come from Commons', () => {
    // Anything else was set deliberately, not imported by the enrichment.
    expect(campusPhoto('https://cdn.rakuxon.com/cardiff.jpg')).toBe(
      'https://cdn.rakuxon.com/cardiff.jpg',
    );
  });

  it.each([null, undefined, ''])('has nothing to show for %s', (value) => {
    expect(campusPhoto(value)).toBeNull();
  });
});

describe('commonsFilePage', () => {
  it('links the credit to the file page, where the photographer is named', () => {
    expect(commonsFilePage(commons('Cardiff%20campus.jpg'))).toBe(
      'https://commons.wikimedia.org/wiki/File:Cardiff%20campus.jpg',
    );
  });

  it('has no file page for an image from anywhere else', () => {
    expect(commonsFilePage('https://cdn.rakuxon.com/cardiff.jpg')).toBeNull();
  });
});
