import { z } from "zod";

export const schema = z.object({
  code: z.string().min(1, "กรุณากรอกรหัสยา").max(50),
  name: z.string().min(1, "กรุณากรอกชื่อยา").max(150),
  category_id: z.string().uuid("กรุณาเลือกหมวดหมู่"),
  unit: z.string().min(1, "กรุณากรอกหน่วยนับ").max(30),
  reorder_level: z
    .number({ error: "กรุณากรอกตัวเลข" })
    .int()
    .min(0, "ต้องไม่ติดลบ"),
  description: z.string().optional(),
});

export type FormValues = z.infer<typeof schema>;
