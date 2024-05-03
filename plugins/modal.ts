class Modal {
    public modals: Array<{ srl: number, type: 'alert' | 'form', title: string, content: string, forms?: Array<{ type: 'input' | 'select' | 'file' | 'toggle', title: string, name: string, placeholder: string, options?: Array<{ name: string, value: string }>, value?: string }>, isForced?: boolean, callback?: Function, buttonText?: { cancel: string, continue?: string }, isActive: boolean }> = reactive(new Array())

    public add (_type: 'alert' | 'form', _title: string, _content: string, _forms?: Array<{ type: 'input' | 'select' | 'file' | 'toggle', title: string, name: string, placeholder: string, options?: Array<{ name: string, value: string }>, value?: string }>, _isForced?: boolean, _callback?: Function, _buttonText?: { cancel: string, continue?: string }): void {
        const _srl = this.modals.length
        if(_forms) {
            if(_forms.filter(_form => { return _form.type == 'select' && typeof _form.options == 'undefined' }).length !== 0) throw 'Invalid request.'
        }
        this.modals.push({
            srl: _srl,
            type: _type,
            title: _title,
            content: _content,
            forms: _forms,
            isForced: _isForced,
            callback: _callback,
            buttonText: _buttonText,
            isActive: true
        })
    }
}

export default defineNuxtPlugin((_nuxtApp): {
    provide: {
        modal: Modal
    }
} => {
    return {
        provide: {
            modal: new Modal()
        }
    }
})