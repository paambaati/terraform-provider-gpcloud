import { serve } from "terrably";
import { GpcloudProvider } from "./provider.js";

serve(new GpcloudProvider()).catch((err) => {
  process.stderr.write(`Fatal: ${String(err)}\n`);
  process.exit(1);
});
