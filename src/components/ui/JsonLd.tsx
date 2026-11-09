/**
 * schema.org structured data as a JSON-LD <script>. `<` is escaped so a
 * string in the payload can never close the script tag (per the Next.js
 * JSON-LD guide).
 */
export function JsonLd({ data }: { readonly data: unknown }): React.JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
