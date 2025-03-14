import { DebugDriver, DebugMessageArg } from "@/drivers";

export class Logger {
  private prefix: string;

  constructor(prefix = "") {
    this.prefix = prefix;
  }

  public info(...message: DebugMessageArg[]) {
    DebugDriver.info(`(${this.prefix})`, ...message);
  }

  public warn(...message: DebugMessageArg[]) {
    DebugDriver.warn(`(${this.prefix})`, ...message);
  }

  public error(...message: DebugMessageArg[]) {
    DebugDriver.error(`(${this.prefix})`, ...message);
  }
}
