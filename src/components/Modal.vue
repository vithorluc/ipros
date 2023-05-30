<template>
    <div class="modal flex">
        <div class="modal-content">
            <p>Tem certeza que deseja sair? Suas alterações não serão salvas</p>
            <div class="actions flex">
                <button @click="closeModal" class="purple">Retornar</button>
                <button @click="closeInvoice" class="red">Fechar</button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
export default {
    name: "modal",
    methods: {
        ...mapMutations(["TOOGLE_MODAL", "TOOGLE_INVOICE", "TOGGLE_EDIT_INVOICE"]),

        closeModal() {
            this.TOOGLE_MODAL()
        },

        closeInvoice() {
            this.TOOGLE_MODAL()
            this.TOOGLE_INVOICE()
            if (this.editInvoice) {
                this.TOGGLE_EDIT_INVOICE()
            }
        }

    },
    computed: {
        ...mapState(["editInvoice"])
    }
}
</script>

<style lang="scss" scoped>
.modal {
    z-index: 100;
    position: fixed;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;

    .modal-content {
        border-radius: 20px;
        padding: 48px 32px;
        max-width: 450px;
        background-color: #252945;
        color: #fff;

        p {
            text-align: center;
        }

        .actions {
            margin-top: 24px;

            button {
                flex: 1;
            }
        }
    }
}
</style>