import { createFileRoute } from "@tanstack/react-router";
import { BackButton } from "@/components/mm/BackButton";
import { Card, Muted, ScreenTitle } from "@/components/mm/ui";
import { erin, erinBio } from "@/content/erin";

export const Route = createFileRoute("/erin")({
  head: () => ({
    meta: [
      { title: "Dr Erin Kelly · Midlife Mind" },
      { name: "description", content: "Who built Midlife Mind: Dr Erin Kelly, Clinical Psychologist." },
      { property: "og:title", content: "Dr Erin Kelly · Midlife Mind" },
      { property: "og:description", content: "Who built Midlife Mind and why." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ErinProfile,
});

function ErinProfile() {
  return (
    <>
      <BackButton />
      <ScreenTitle eyebrow="Created by" title={erin.name} sub={erin.role} />

      <Card className="items-center text-center">
        <img
          src={erin.photo}
          alt={erin.photoAlt}
          width={168}
          height={210}
          className="aspect-[4/5] w-[168px] rounded-[24px] border-4 border-card object-cover object-top shadow-lift"
        />
        <div className="flex flex-col gap-2.5">
          <h3>{erin.name}</h3>
          <p className="eyebrow">{erin.role}</p>
          {erinBio.map((p) => (
            <Muted key={p.slice(0, 24)} className="text-left">
              {p}
            </Muted>
          ))}
        </div>
      </Card>

      <Muted className="text-center">
        Midlife Mind is education and skills, not medical advice, diagnosis or treatment.
      </Muted>
    </>
  );
}
