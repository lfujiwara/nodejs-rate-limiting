export interface EnvConfig {
  privateRoutesSecret: string;
}

export const envConfig: EnvConfig = {
  privateRoutesSecret:
    process.env.PRIVATE_ROUTES_SECRET || '61D19E59-B95F-480A-930F-B4480BC96AE2',
};
