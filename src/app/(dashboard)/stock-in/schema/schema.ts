import { z } from "zod";

export const StockInSchema = z.object({
  medicine_id: z.string().uuid("กรุณาเลือกยา"),
  lot_number: z.string().min(1, "กรุณากรอกเลขล็อต").max(60),
  expiry_date: z.string().min(1, "กรุณาเลือกวันหมดอายุ"),
  quantity: z.number({ error: "กรุณากรอกจำนวน" }).int().positive("ต้องมากกว่า 0"),
  reference_no: z.string().optional(),
});

export type StockInFormValues = z.infer<typeof StockInSchema>;
