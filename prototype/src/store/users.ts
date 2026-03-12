export interface DemoUser {
  username: string;
  password: string;
  name: string;
  age: number;
}

const users = new Map<string, DemoUser>([
  ['jane.smith', { username: 'jane.smith', password: 'password', name: 'Jane Smith', age: 25 }],
  ['tom.young',  { username: 'tom.young',  password: 'password', name: 'Tom Young',  age: 16 }],
  ['alex.wong',  { username: 'alex.wong',  password: 'password', name: 'Alex Wong',  age: 18 }],
]);

export function authenticate(username: string, password: string): DemoUser | null {
  const user = users.get(username);
  if (!user || user.password !== password) return null;
  return user;
}
