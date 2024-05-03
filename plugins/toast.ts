class Toast {
    public toasts: Array<{ srl: number, type: 'info' | 'success' | 'warning' | 'danger', message: string, isActive: boolean }> = reactive(new Array())

    public add (_type: 'info' | 'success' | 'warning' | 'danger', _message: string, _timeout: number = 5000): void {
        const _element = document.getElementById("toast-area")
        if(_element == null) throw 'Not found toast area.'

        const _srl = this.toasts.length
        this.toasts.push({
            srl: _srl,
            type: _type,
            message: _message,
            isActive: true
        })

        _element.scrollTo({
            top: (_element.scrollHeight),
            behavior: "smooth"
        })
        setTimeout(() => {
            this.toasts[_srl].isActive = false
        }, _timeout)
    }
}

export default defineNuxtPlugin((_nuxtApp): {
    provide: {
        toast: Toast
    }
} => {
    return {
        provide: {
            toast: new Toast()
        }
    }
})