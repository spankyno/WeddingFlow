import { TableCanvas } from "@/components/dashboard/tables/table-canvas";

export default async function TablesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return (
    <div>
      <h1 className="font-display text-4xl">Mesas</h1>
      <div className="mt-8">
        <TableCanvas eventId={eventId} />
      </div>
    </div>
  );
}
