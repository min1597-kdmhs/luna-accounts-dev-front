import vClickOutsideElement from 'vue-click-outside-element'
import { vMaska } from 'maska'
export const _globalConfig: {
    network: boolean
} = reactive({
    network: false
})

function errorMessage (_error?: string) {
    console.log(_error)
    if(typeof _error == 'string') {
        if(_error.split(':').length == 2) {
            switch (_error.split(':')[0]) {
                case 'CustomizedError': return _error.split(':')[1]
                default: '정의되지 않은 오류(06)'
            }
        }
        switch (_error) {
            case 'Invalid request.': return '잘못된 접근입니다.'
            case 'Required parameter is missing.': return '필수 입력 사항을 모두 입력해주세요.'

            default: return '정의되지 않은 오류(05)'
        }
    } else return '정의되지 않은 오류(04)'
}

function errorConvert (_error: any) {
    try {
        if(typeof _error == 'string') return `${ errorMessage(_error).indexOf('정의되지 않은 오류') !== -1 ? `${ errorMessage(_error) }<br>${ _error }` : errorMessage(_error) }`
        if(typeof _error == 'object') {
            if(typeof _error.response == 'object') {
                return `${ _error.response.data.error.description.ko ?? errorMessage(_error.response.data.error.description.en) }<br>자세한 내용은 고객센터로 문의해주세요.`
            } else return `정의되지 않은 오류(L01)<br>자세한 내용은 고객센터로 문의해주세요.`
        } else return `정의되지 않은 오류(L02)<br>자세한 내용은 고객센터로 문의해주세요.`
    } catch(_error) { return `에러핸들링 오류(L03)<br>자세한 내용은 고객센터로 문의해주세요.` }
}

export default defineNuxtPlugin((nuxtApp): {
    provide: {
        loadingView: { status: boolean },
        globalConfig: {
            network: boolean
        },
        developMode: boolean,

        errorConvert: Function,
        copy: Function,
        JSON: {
            encode: (_object: object) => string,
            decode: (_text: string) => object
        }
    }
} => {
    nuxtApp.vueApp.use(vClickOutsideElement)
    nuxtApp.vueApp.directive('maska', vMaska)
    
    return {
        provide: {
            loadingView: reactive({ status: false }),
            globalConfig: reactive(_globalConfig),
            developMode: true,

            errorConvert: errorConvert,
            copy: function (_text: string) {
                navigator.clipboard.writeText(_text)
            },
            JSON: {
                encode: (_object: object) => { return JSON.stringify(_object) },
                decode: (_text: string) => { return JSON.parse(_text) }
            }
        }
    }
})