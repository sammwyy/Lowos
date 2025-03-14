export type DebugMessageArg =
  | string
  | number
  | boolean
  | object
  | null
  | undefined;

function rawPrint(
  level: "info" | "warn" | "error",
  ...message: DebugMessageArg[]
) {
  switch (level) {
    case "info":
      console.log("[INFO]", ...message);
      break;
    case "warn":
      console.warn("[WARN]", ...message);
      break;
    case "error":
      console.error("[ERROR]", ...message);
      break;
  }
}

export const DebugDriver = {
  info: (...message: DebugMessageArg[]) => rawPrint("info", ...message),
  warn: (...message: DebugMessageArg[]) => rawPrint("warn", ...message),
  error: (...message: DebugMessageArg[]) => rawPrint("error", ...message),
};
