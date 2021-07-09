export class IdGenerator {
  id = 0;
  prefix = "";
  constructor(prefix: string) {
    this.prefix = prefix;
  }

  getNewId() {
    const { prefix } = this;
    return prefix + ++this.id;
  }

  setId(id: number) {
    this.id = id;
  }
}
