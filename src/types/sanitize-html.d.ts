declare module 'sanitize-html' {
  interface Attributes {
    [attribute: string]: string[];
  }

  interface IDefaults {
    allowedTags: string[];
    allowedAttributes: Attributes;
  }

  interface TransformTag {
    tagName: string;
    attribs: Record<string, string>;
  }

  interface IOptions {
    allowedTags?: string[];
    allowedAttributes?: Attributes;
    transformTags?: Record<string, (tagName: string, attribs: Record<string, string>) => TransformTag>;
  }

  function sanitizeHtml(dirty: string, options?: IOptions): string;

  namespace sanitizeHtml {
    const defaults: IDefaults;
    function simpleTransform(tagName: string, attribs: Record<string, string>, merge?: boolean): (tagName: string, attribs: Record<string, string>) => TransformTag;
  }

  export = sanitizeHtml;
}
