import "dotenv/config";
import { z } from "zod";

const schema=z.object({APP_MODE:z.enum(["demo","production"]).default("demo"),PORT:z.coerce.number().default(4000),WEB_ORIGIN:z.string().default("http://localhost:5173"),MSC_DEMO_DATABASE_URL:z.string().min(1),DATABASE_URL:z.string().min(1),JWT_ACCESS_SECRET:z.string().min(32),JWT_REFRESH_SECRET:z.string().min(32)});
const parsed=schema.safeParse(process.env);
if(!parsed.success) throw new Error(`Invalid server configuration: ${parsed.error.issues.map(i=>i.path.join(".")).join(", ")}`);
export const config={...parsed.data,databaseUrl:parsed.data.APP_MODE==="demo"?parsed.data.MSC_DEMO_DATABASE_URL:parsed.data.DATABASE_URL};
