import {HistoryCompo} from "@/components/history";
import AppLayout from "@/components/layouts/app.layout";

export default function HistoriquePage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
      
        <HistoryCompo />
      </div>
    </AppLayout>
  );
}