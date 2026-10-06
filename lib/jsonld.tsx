// JSON-LD sigur: escapăm „<” ca să nu se poată închide tag-ul <script>.
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
