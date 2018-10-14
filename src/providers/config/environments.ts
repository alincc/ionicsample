export enum Environments {Production, Staging, Development}

export function environmentName(env): string {
  switch (env) {
    case Environments.Production:
      return "production";
    case Environments.Staging:
      return "staging";
    case Environments.Development:
      return "dev";
  }
}
