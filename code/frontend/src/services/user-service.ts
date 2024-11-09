import { API_VERSION, BASE_API_URL } from '../utils/constants';

export type User = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
};

export async function getAuthUser(): Promise<User> {
  const AUTH_USER_API_URL = `${BASE_API_URL}/${API_VERSION}/users/me`;
  const response = await fetch(AUTH_USER_API_URL);

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
