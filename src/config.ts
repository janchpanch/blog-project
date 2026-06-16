import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

export function setUser(usr: string) {
  let cfg = readConfig();  
  writeConfig({currentUserName: usr, dbUrl: cfg.dbUrl})
}

export function readConfig(): Config {
  let cfg = JSON.parse(
    fs.readFileSync(getConfigFilePath(), { encoding: "utf-8" }),
  );
  return validateConfig(cfg);
}

export function getConfigFilePath(): string {
  return path.join(os.homedir(), "/.gatorconfig.json");
}

function writeConfig(cfg: Config): void {
  fs.writeFileSync(getConfigFilePath(), JSON.stringify(cfg));
}

function validateConfig(rawConfig: any): Config {
  if (typeof rawConfig !== "object" || rawConfig === null) {
    throw new Error("invalid config");
  }

  if (typeof rawConfig.dbUrl !== "string") {
    throw new Error("invalid config db_url");
  }

  if (typeof rawConfig.currentUserName !== "string") {
    throw new Error("invalid current_user_name");
  }

  return {
    dbUrl: rawConfig.dbUrl,
    currentUserName: rawConfig.currentUserName,
  };
}
