import { UserSignUpInterface, UserSignInInterface } from "@/interfaces/interfaces";

export async function signUpAccount(user: UserSignUpInterface): Promise<{ token: string, userID: string }> {
  const url = "http://10.0.2.2:8100/create-new-account";

  const formData = new URLSearchParams(user as Record<string, string>);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to create account: ${response.statusText}`);
  }
  const data = await response.json() as { token: string, userID: string };
  console.log("Token received:", data.token, "UserID:", data.userID)
  return { token: data.token, userID: data.userID };
}

export async function signInAccount(user: UserSignInInterface): Promise<{ token: string, userID: string }> {
  const url = "http://10.0.2.2:8100/authenticate";

  const formData = new URLSearchParams(user as Record<string, string>);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to sign in account: ${response.statusText}`);
  }
  const data = await response.json() as { token: string, userID: string };
  console.log("Token received:", data.token, "UserID:", data.userID)
  return { token: data.token, userID: data.userID };
}