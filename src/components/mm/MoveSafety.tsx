import { Card, Pill } from "./ui";

export function SafetyCard({ onDone }: { onDone: () => void }) {
  return (
    <Card className="border-gold bg-gold-soft">
      <h3>Before you start</h3>
      <p className="text-sm">These sessions are gentle, but please see your GP before starting if you have:</p>
      <ul className="ml-5 list-disc text-sm">
        <li>chest pain or a heart condition</li><li>dizziness or fainting</li><li>osteoporosis, or a fracture from a minor fall</li>
        <li>prolapse, or leaking with exercise</li><li>had recent surgery</li><li>pain that gets worse with movement</li>
      </ul>
      <p className="text-sm">Stop if anything hurts. Easier versions are there for every move.</p>
      <Pill onClick={onDone}>Got it</Pill>
    </Card>
  );
}

