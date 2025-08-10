import { useEffect, useState, useCallback } from "react";
import { publicService, FoundationType, FoundationTypeResponse } from "@/services/public.service";

/**
 * useFoundationTypes
 * - ดึงประเภทมูลนิธิจาก /api/public/foundations/types
 * - คืนค่าเป็น FoundationType[] พร้อมสถานะ loading/error และฟังก์ชัน refresh
 */
export function useFoundationTypes() {
  const [types, setTypes] = useState<FoundationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ใช้เมธอดที่แมป envelope เต็ม
      const res = await publicService.getFoundationTypesResponse();
      const payload = res.data as FoundationTypeResponse;

      if (!payload?.success || !Array.isArray(payload.data)) {
        setTypes([]);
        setError("ไม่พบข้อมูลประเภทมูลนิธิ");
      } else {
        // normalize ข้อมูลเพื่อความปลอดภัยของชนิด
        const normalized = payload.data.map((item) => ({
          type_id: Number(item.type_id),
          name: String(item.name ?? ""),
          description: String(item.description ?? ""),
        }));
        setTypes(normalized);
      }
    } catch (e: any) {
      setError(e?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทมูลนิธิ");
      setTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return { types, loading, error, refresh: fetchTypes };
}

export default useFoundationTypes;
