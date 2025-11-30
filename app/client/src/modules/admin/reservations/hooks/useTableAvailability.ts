import { useState, useEffect } from "react";
import { reservationApi } from "../services/reservation.service";
import { CheckAvailabilityDto } from "../types";

// Hook to check table availability
export function useTableAvailability(params: CheckAvailabilityDto | null) {
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkAvailability = async () => {
        if (!params) {
            setTables([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await reservationApi.checkAvailability(params);
            setTables(data);
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to check availability"
            );
            setTables([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAvailability();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        params?.date,
        params?.partySize,
        params?.duration,
        params?.floor,
        params?.section,
    ]);

    return { tables, loading, error, refetch: checkAvailability };
}
