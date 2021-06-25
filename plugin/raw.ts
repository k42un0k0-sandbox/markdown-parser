export default function raw(options: { fileRegex: RegExp }) {
  return {
    name: "raw",
    transform(code: string, id: string): { code: string } {
      if (options.fileRegex.test(id)) {
        const json = JSON.stringify(code);
        return {
          code: `export default ${json}`,
        };
      }
    },
  };
}
