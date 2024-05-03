import { _globalConfig } from './module'

export default defineNuxtPlugin((_nuxtApp): {
    provide: {
        QR: {
            data: {
                code: string,
                verificationCode: string,
                isLoading: boolean,
                isActive: boolean
            },
            close: Function
        }
    }
} => {
    return {
        provide: {
            QR: {
                data: reactive({
                    code: '',
                    verificationCode: '',
                    isLoading: true,
                    isActive: false
                }),
                close: function () {
                    this.data.isActive = false
                    this.data.isLoading = true
                }
            }
        }
    }
})