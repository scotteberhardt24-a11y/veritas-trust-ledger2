"use client";

import { useEffect, useState } from "react";
import { realtime } from "@/lib/realtime";

export function useRealtime() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    realtime.connect();

    realtime.on("JOB_CREATED", (data) => {
      setEvents((prev) => [
        { type: "JOB_CREATED", data },
        ...prev,
      ]);
    });

    realtime.on("JOB_COMPLETED", (data) => {
      setEvents((prev) => [
        { type: "JOB_COMPLETED", data },
        ...prev,
      ]);
    });

    realtime.on("WORKER_FLAGGED", (data) => {
      setEvents((prev) => [
        { type: "WORKER_FLAGGED", data },
        ...prev,
      ]);
    });

    return () => realtime.disconnect();
  }, []);

  return { events };
}