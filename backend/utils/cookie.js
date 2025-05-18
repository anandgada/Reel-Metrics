export const getCookieForPlaywright = () => {
  const cookieJson = process.env.IG_COOKIE_JSON;
  const cookie = JSON.parse(cookieJson || "{}");
  const cookies = [];
  Object.entries(cookie).forEach(([key, value]) => {
    cookies.push({
      name: key,
      value: value,
      domain: ".instagram.com",
      path: "/",
      secure: true,
    });
  });
  return cookies;
};
