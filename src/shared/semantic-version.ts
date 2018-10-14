export class SemanticVersion {

  public major: number;
  public minor: number;
  public patch: number;
  public stage: string;

  constructor(major: number, minor: number, patch: number, stage: string) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.stage = stage;
  }

  public static parse(version: string): SemanticVersion {
    let [partsString, stage] = version.split("-");
    let parts = partsString.split(".");
    let major = parseInt(parts.length > 0 ? parts[0] : '0');
    let minor = parseInt(parts.length > 1 ? parts[1] : '0');
    let patch = parseInt(parts.length > 2 ? parts[2] : '0');
    return new SemanticVersion(major, minor, patch, stage);
  }

  public compare(compareTo: SemanticVersion): (0 | 1 | -1) {
    return this.major > compareTo.major || this.major === compareTo.major && this.minor > compareTo.minor || this.major === compareTo.major && this.minor === compareTo.minor && this.patch > compareTo.patch ? 1
      : (this.major < compareTo.major || this.major === compareTo.major && this.minor < compareTo.minor || this.major === compareTo.major && this.minor === compareTo.minor && this.patch < compareTo.patch ? -1 : 0);
  }

  public toString(): string {
    return `${this.major}.${this.minor}.${this.patch}` + (this.stage ? '-' + this.stage : '');
  }

}
