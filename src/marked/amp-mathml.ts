export const ampMathmlRenderer = (token: any) =>
  `<amp-mathml layout="container" data-fomula="${token.raw}"></amp-mathml>`;
