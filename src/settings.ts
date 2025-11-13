export interface MyPluginSettings {
    mySetting: string;
    blurEnabled: boolean;
    blurIntensity: number; // 模糊强度，范围 0-20
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default',
    blurEnabled: false,
    blurIntensity: 6
};