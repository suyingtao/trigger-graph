export class IdGenerator {
  id = 0;
  constructor(private prefix: string) {}

  getNewId() {
    const { prefix } = this;
    return prefix + ++this.id;
  }

  setId(id: number) {
    this.id = id;
  }
}
