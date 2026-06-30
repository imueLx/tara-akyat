import { serializeJsonLd } from "@/lib/seo";

type Props = {
  id: string;
  data: unknown;
};

export function JsonLdScript({ id, data }: Props) {
  return (
    <script
      id={id}
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
