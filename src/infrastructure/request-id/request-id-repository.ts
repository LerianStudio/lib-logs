import { v4 as uuidv4 } from 'uuid';

export class RequestIdRepository {
  private id: string | undefined;

  generate() {
    return uuidv4();
  }

  get() {
    return this.id;
  }

  set(id: string) {
    this.id = id;
  }
}
