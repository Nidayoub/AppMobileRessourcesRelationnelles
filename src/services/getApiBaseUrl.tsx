import { Platform } from 'react-native'
import Constants from 'expo-constants'

const LOCAL_PORT = 8443

function getLocalhostFromExpo(): string {
    const host = Constants.expoConfig?.hostUri ?? Constants.expoConfig?.extra?.hostUri
    return host?.split(':')[0] || 'localhost'
}

export function getApiBaseUrl(): string {
    /**
     * eslint-disable-next-line @typescript-eslint/ban-ts-comment
     * @ts-expect-error
     */
    if (__DEV__) {
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
            const ip = getLocalhostFromExpo()
            return `https://${ip}:${LOCAL_PORT}`
        }

        return `https://localhost:${LOCAL_PORT}`
    }
    return `https://api.labrocamoma.com`
}
