export default defineNuxtPlugin((nuxtApp): {
    provide: {
        userinfo: {
            id: string | null,
            username: string | null,
            profile: {
                first_name: string,
                middle_name: string | null,
                last_name: string,
                nickname: string,
                
                created_at: string
            } | null,
            birthday: string | null,
            gender: string | null,
            emails: Array<{
                id: string,
                email_address: string,
                added_at: string,
                is_verified: boolean,
                is_primary: boolean
            }> | null,
            phones: Array<{
                id: string,
                phone_number: string,
                added_at: string,
                is_verified: boolean,
                is_primary: boolean
            }> | null,
            authorized_apps: Array<{
                id: string,
                image: string,
                name: string,
                privacy: string,
                terms: string,

                permissions: Array<{ id: string, name: string, icon: string }>
            }> | null,
            owned_apps: Array<{
                id: string,
                image: string,
                name: string,
                permissions: Array<{ id: string, name: string, description: string, icon: string, is_required: boolean }>,
                redirect_uris: Array<string>,
                managers: Array<{ id: string, full_name: string }>,
                secret_key: string
            }> | null,
            last_password_updated_at: string | null,
            last_authorized_at: string | null
        }
    }
} => {
    return {
        provide: {
            userinfo: reactive({
                id: null,
                username: null,
                profile: null,
                birthday: null,
                gender: null,
                emails: null,
                phones: null,
                authorized_apps: null,
                owned_apps: null,
                last_password_updated_at: null,
                last_authorized_at: null
            })
        }
    }
})