import axios from 'axios'


export default defineNuxtPlugin((_nuxtApp): {
    provide: {
        loadSession: Function,
        sessionInitlization: Function
    }
} => {
    const runtimeConfig = useRuntimeConfig()

    let _isLoaded: boolean = false

    async function loadSession () {
        try {
            if(typeof window.localStorage.getItem('session') == 'string') {
                try {
                    const _result = await axios.get(`${ runtimeConfig.public.apiEndpoint }/tokeninfo`, { headers: { authorization: window.localStorage.getItem('session') } })
                    if(_result.status == 200) {
                        console.log(
                            `%cLuna System %c Session loaded from localStorage.`,
                            'color: white; border-radius: 3px 0 0 3px; padding: 2px 2px 1px 10px; background: #7F4C8A',
                            'border-radius: 0 3px 3px 0; padding: 2px 10px 1px 2px; background: #7F4C8A20',
                        '')
                    } else throw 'Wrong session.'
                } catch(_error) {
                    window.localStorage.removeItem('session')
                    console.log(
                        `%cLuna System %c Session was expired.`,
                        'color: white; border-radius: 3px 0 0 3px; padding: 2px 2px 1px 10px; background: #7F4C8A',
                        'border-radius: 0 3px 3px 0; padding: 2px 10px 1px 2px; background: #7F4C8A20',
                    '')
                    loadSession()
                }
                return true
            } else {
                const _result = await axios.put(`${ runtimeConfig.public.apiEndpoint }/session`, {  }, { headers: {  } })
                if(_result.status == 201) {
                    window.localStorage.setItem('session', `${ _result.data.data.token_type } ${ _result.data.data.token }`)
                    console.log(
                        `%cLuna System %c Session issued.`,
                        'color: white; border-radius: 3px 0 0 3px; padding: 2px 2px 1px 10px; background: #7F4C8A',
                        'border-radius: 0 3px 3px 0; padding: 2px 10px 1px 2px; background: #7F4C8A20',
                    '')
                    return true
                } else throw 'Failed to load session.'
            }
        } catch(_error) { throw _error }
    }

    async function sessionInitlization () {
        try {
            if(_isLoaded == false) {
                _isLoaded = true
                await loadSession()
            }

            let _loadingWeight = 100
            while (true) {
                if(typeof window.localStorage.getItem('session') !== 'string') {
                    await new Promise((resolve, reject) => {
                        setTimeout(() => resolve(true), _loadingWeight)
                    })
                    _loadingWeight *= 2
                } else break
            }
        } catch(_error) { throw _error }
    }

    return {
        provide: {
            loadSession,
            sessionInitlization
        }
    }
})