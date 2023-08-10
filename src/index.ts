import { timing, logTimings, important } from "./decorators/performance";

function delay<T>(time: number, value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), time);
  });
}

@logTimings
class UserRepository {
  @timing()
  async getUsers() {
    return await delay(1000, []);
  }

  @timing()
  async getUser(@important id: number) {
    return await delay(50, {
      id: `user:${id}`,
    });
  }
}

(async () => {
  const users = new UserRepository();

  const user = await users.getUser(10);

  console.log(`Got ${JSON.stringify(user)}`);

  await users.getUser(20);

  await users.getUsers();

  // @ts-ignore
  console.log(users?.printTimings());
})();
