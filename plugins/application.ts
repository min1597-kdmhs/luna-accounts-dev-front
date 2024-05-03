export default defineNuxtPlugin((): {
    provide: {
        application: {
            uuid: string | null,
            name: string | null,
            icon: string | null,
            status: 'Normal' | 'Verified' | 'Family' | 'Warned' | null,
            permissions: Array<string>
        },
        request: {
            client_id: string | null,
            redirect_uri: string | null,
            response_type: string | null,
            scope: string | null,
            state: string | null,
            code_challenge: string | null,
            code_challenge_method: string | null,
        },
        permissions: {
            scopes: Array<string>,
            permissions: Array<{ id: string, name: string, icon: string, isRequired: boolean }>
        }
    }
} => {
    return {
        provide: {
            application: reactive({
                uuid: null,
                name: null,
                icon: null,
                status: null,
                permissions: new Array()
            }),
            request: reactive({
                client_id: null,
                redirect_uri: null,
                response_type: null,
                scope: null,
                state: null,
                code_challenge: null,
                code_challenge_method: null
            }),
            permissions: reactive({
                scopes: new Array(),
                permissions: new Array()
            })
        }
    }
})