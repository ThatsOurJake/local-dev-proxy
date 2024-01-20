import config from "./config";

export const parseDomain = (host: string) => {
  const { baseDomain } = config;
  const domain = host.replace(`.${baseDomain}`, "").trim();

  if (domain.length === 0) {
    throw new Error("Domain is empty");
  }

  return domain;
};
