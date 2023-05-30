<template>
    <div @click="checkClick" ref="invoiceWrap" class="invoice-wrap flex flex-column">
        <form @submit.prevent="submitForm" class="invoice-content">
            <Loading v-show="loading" />
            <h1 v-if="!editInvoice">Nova Fatura</h1>
            <h1 v-else>Editar Fatura</h1>
            <!-- Bill Form -->
            <div class="bill-from flex flex-column">
                <h4>Cobrar de</h4>
                <div class="input flex flex-column">
                    <label for="billerStreetAddress">Rua</label>
                    <input required type="text" id="billerStreetAddress" v-model="billerStreetAddress">
                </div>
                <div class="location-details flex">
                    <div class="input flex flex-column">
                        <label for="billerCity">Cidade</label>
                        <input required type="text" id="billerCity" v-model="billerCity">
                    </div>
                    <div class="input flex flex-column">
                        <label for="billerZipCode">CEP</label>
                        <input required type="text" id="billerZipCode" v-model="billerZipCode">
                    </div>
                    <div class="input flex flex-column">
                        <label for="productDescription">Descrição do Produto</label>
                        <input required type="text" id="productDescription" v-model="productDescription">
                    </div>
                </div>
            </div>
            <!-- Bill to -->
            <div class="bill-to flex flex-column">
                <h4>Enviar para</h4>
                <div class="input flex flex-column">
                    <label for="clientName">Nome do Cliente</label>
                    <input required type="text" id="clientName" v-model="clientName">
                </div>
                <div class="input flex flex-column">
                    <label for="clientEmail">Email do Cliente</label>
                    <input required type="text" id="clientEmail" v-model="clientEmail">
                </div>
                <div class="input flex flex-column">
                    <label for="clientStreetAddress">Rua</label>
                    <input required type="text" id="clientStreetAddress" v-model="clientStreetAddress">
                </div>
                <div class="location-details flex">
                    <div class="input flex flex-column">
                        <label for="clientCity">Cidade</label>
                        <input required type="text" id="clientCity" v-model="clientCity">
                    </div>
                    <div class="input flex flex-column">
                        <label for="clientZipCode">CEP</label>
                        <input required type="text" id="clientZipCode" v-model="clientZipCode">
                    </div>
                    <div class="input flex flex-column">
                        <label for="clientCountry">País</label>
                        <input required type="text" id="clientCountry" v-model="clientCountry">
                    </div>
                </div>
            </div>
            <!-- Invoice Work Details -->
            <div class="invoice-work flex flex-column">
                <div class="payment flex">
                    <div class="input flex flex-column">
                        <label for="invoiceDate">Data da Fatura</label>
                        <input disabled type="text" id="invoiceDate" v-model="invoiceDate">
                    </div>
                    <div class="input flex flex-column">
                        <label for="paymentDueDate">Vencimento do Pagamento</label>
                        <input disabled type="text" id="paymentDueDate" v-model="paymentDueDate">
                    </div>
                </div>
                <!-- Payment Terms -->
                <div class="input flex flex-column">
                    <label for="paymentTerms">Termos de pagamento</label>
                    <select type="text" id="paymentTerms" v-model="paymentTerms">
                        <option>30 dias</option>
                        <option>60 dias</option>
                    </select>
                </div>
                <div class="work-items">
                    <h3>Lista de Items</h3>
                    <table class="item-list">
                        <tr class="table-heading flex">
                            <th class="item-name">Nome do Item</th>
                            <th class="qty">Quantidade</th>
                            <th class="price">Preço</th>
                            <th class="total">Total</th>
                        </tr>
                        <tr class="table-items flex" v-for="(item, index) in invoiceItemList" :key="index">
                            <td class="item-name"><input type="text" v-model="item.itemName"></td>
                            <td class="qty"><input type="text" v-model="item.qty"></td>
                            <td class="price"><input type="text" v-model="item.price"></td>
                            <td class="total flex">R${{ item.total = item.qty * item.price }}</td>
                            <img @click="deleteInvoiceItem(item.id)" src="@/assets/icon-delete.svg" alt="">
                        </tr>
                    </table>
                    <div @click="addNewInvoiceItem" class="flex button"><img src="@/assets/icon-plus.svg" alt="">
                        Adicionar Novo Item
                    </div>
                </div>
            </div>
            <!-- Save/Exit -->
            <div class="save flex">
                <div class="left">
                    <button type="button" @click="closeInvoice" class="red">Cancelar</button>
                </div>
                <div class="right flex">
                    <button v-if="!editInvoice" type="submit" @click="saveDraft" class="dark-purple">Salvar
                        Rascunho</button>
                    <button v-if="!editInvoice" type="submit" @click="publishInvoice" class="purple">Criar Fatura</button>
                    <button v-if="editInvoice" type="submit" class="purple">Atualizar Fatura</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import Loading from '../components/Loading.vue'
import firebaseApp from '../firebase/firebaseInit.ts'
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { mapMutations, mapState, mapActions } from 'vuex';
import { uid } from 'uid';
export default {
    name: "invoiceModal",
    data() {
        return {
            loading: false,
            dateOptions: { year: "numeric", month: "short", day: "numeric" },
            docId: null,
            billerStreetAddress: null,
            billerCity: null,
            billerZipCode: null,
            billerCountry: null,
            clientName: null,
            clientEmail: null,
            clientStreetAddress: null,
            clientCity: null,
            clientZipCode: null,
            clientCountry: null,
            invoiceDateUnix: null,
            invoiceDate: null,
            paymentTerms: null,
            paymentDueDateUnix: null,
            paymentDueDate: null,
            productDescription: null,
            invoicePending: null,
            invoiceDraft: null,
            invoiceItemList: [],
            invoiceTotal: 0,
        };
    },
    components: {
        Loading
    },
    created() {
        if (!this.editInvoice) {
            this.invoiceDateUnix = Date.now()
            this.invoiceDate = new Date(this.invoiceDateUnix).toLocaleDateString('pt-br', this.dateOptions)
        }

        if (this.editInvoice) {
            const currentInvoice = this.currentInvoiceArray[0]
            this.docId = currentInvoice.invoiceId;
            this.billerStreetAddress = currentInvoice.billerStreetAddress;
            this.billerCity = currentInvoice.billerCity;
            this.billerZipCode = currentInvoice.billerZipCode;
            this.billerCountry = currentInvoice.billerCountry;
            this.clientName = currentInvoice.clientName;
            this.clientEmail = currentInvoice.clientEmail;
            this.clientStreetAddress = currentInvoice.clientStreetAddress;
            this.clientCity = currentInvoice.clientCity;
            this.clientZipCode = currentInvoice.clientZipCode;
            this.clientCountry = currentInvoice.clientCountry;
            this.invoiceDateUnix = currentInvoice.invoiceDateUnix;
            this.invoiceDate = currentInvoice.invoiceDate;
            this.paymentTerms = currentInvoice.paymentTerms;
            this.paymentDueDateUnix = currentInvoice.paymentDueDateUnix;
            this.paymentDueDate = currentInvoice.paymentDueDate;
            this.productDescription = currentInvoice.productDescription;
            this.invoicePending = currentInvoice.invoicePending;
            this.invoiceDraft = currentInvoice.invoiceDraft;
            this.invoiceItemList = currentInvoice.invoiceItemList;
            this.invoiceTotal = currentInvoice.invoiceTotal;
        }
    },
    methods: {
        ...mapMutations(["TOOGLE_INVOICE", "TOOGLE_MODAL", "TOGGLE_EDIT_INVOICE"]),
        ...mapActions(["UPDATE_INVOICE", "GET_INVOICES"]),

        closeInvoice() {
            this.TOOGLE_INVOICE();
            if (this.editInvoice) {
                this.TOGGLE_EDIT_INVOICE()
            }
        },
        addNewInvoiceItem() {
            this.invoiceItemList.push({
                id: uid(),
                item: "",
                qty: "",
                price: 0,
                total: 0
            })
        },
        deleteInvoiceItem(id) {
            this.invoiceItemList = this.invoiceItemList.filter(item => item.id !== id);
        },
        calculateInvoiceTotal() {
            this.invoiceTotal = 0;
            this.invoiceItemList.forEach(item => {
                this.invoiceTotal += item.total
            })
        },
        publishInvoice() {
            this.invoicePending = true
        },
        saveDraft() {
            this.invoiceDraft = true
        },
        async uploadInvoice() {
            if (this.invoiceItemList.length <= 0) {
                alert('Por Favor, preencha todos os dados necessarios')
                return
            }

            this.loading = true

            this.calculateInvoiceTotal()

            const doc = await addDoc(collection(firebaseApp, "invoices"), {
                invoiceId: uid(6),
                billerStreetAddress: this.billerStreetAddress,
                billerCity: this.billerCity,
                billerZipCode: this.billerZipCode,
                billerCountry: this.billerCountry,
                clientName: this.clientName,
                clientEmail: this.clientEmail,
                clientStreetAddress: this.clientStreetAddress,
                clientCity: this.clientCity,
                clientZipCode: this.clientZipCode,
                clientCountry: this.clientCountry,
                invoiceDate: this.invoiceDate,
                invoiceDateUnix: this.invoiceDateUnix,
                paymentTerms: this.paymentTerms,
                paymentDueDate: this.paymentDueDate,
                paymentDueDateUnix: this.paymentDueDateUnix,
                productDescription: this.productDescription,
                invoiceItemList: this.invoiceItemList,
                invoiceTotal: this.invoiceTotal,
                invoicePending: this.invoicePending,
                invoiceDraft: this.invoiceDraft,
                invoicePaid: null,
            });

            this.loading = false

            this.TOOGLE_INVOICE()
            this.GET_INVOICES();
        },
        async updateInvoice() {
            if (this.invoiceItemList.length <= 0) {
                alert('Por Favor, preencha todos os dados necessarios')
                return
            }

            this.loading = true

            this.calculateInvoiceTotal()

            const docRef = doc(firebaseApp, "invoices", this.docId)

            const updateData = {
                billerStreetAddress: this.billerStreetAddress,
                billerCity: this.billerCity,
                billerZipCode: this.billerZipCode,
                billerCountry: this.billerCountry,
                clientName: this.clientName,
                clientEmail: this.clientEmail,
                clientStreetAddress: this.clientStreetAddress,
                clientCity: this.clientCity,
                clientZipCode: this.clientZipCode,
                clientCountry: this.clientCountry,
                paymentTerms: this.paymentTerms,
                paymentDueDate: this.paymentDueDate,
                paymentDueDateUnix: this.paymentDueDateUnix,
                productDescription: this.productDescription,
                invoiceItemList: this.invoiceItemList,
                invoiceTotal: this.invoiceTotal,
                invoicePending: this.invoicePending,
                invoiceDraft: this.invoiceDraft,
            }

            setDoc(docRef, updateData, { merge: true })

            this.loading = false

            const data = {
                docId: this.docId,
                routeId: this.$route.params.invoiceId
            }

            this.UPDATE_INVOICE(data)
        },
        submitForm() {
            if (this.editInvoice) {
                this.updateInvoice()
                return
            }
            this.uploadInvoice()
        },
        checkClick(e) {
            if (e.target === this.$refs.invoiceWrap) {
                this.TOOGLE_MODAL()
            }
        }
    },
    watch: {
        paymentTerms() {
            const futureDate = new Date();
            this.paymentDueDateUnix = futureDate.setDate(futureDate.getDate() + parseInt(this.paymentTerms))
            this.paymentDueDate = new Date(this.paymentDueDateUnix).toLocaleDateString('pt-br', this.dateOptions)
        },
    },
    computed: {
        ...mapState(["editInvoice", "currentInvoiceArray"]),
    },
}
</script>


<style lang="scss" scoped>
.invoice-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: scroll;

    &::-webkit-scrollbar {
        display: none;
    }

    @media (min-width: 900px) {
        left: 90px;
    }

    .invoice-content {
        position: relative;
        padding: 56px;
        max-width: 700px;
        width: 100%;
        background-color: #141625;
        color: #fff;
        box-shadow: 10px 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

        h1 {
            margin-bottom: 48px;
            color: #fff;
            font-weight: bolder;
        }

        h3 {
            margin-bottom: 16px;
            font-size: 18px;
            color: #777f98;
        }

        h4 {
            color: #7c5dfa;
            font-size: 12px;
            margin-bottom: 24px;
        }

        // Bill To / Bill From
        .bill-to,
        .bill-from {
            margin-bottom: 48px;

            .location-details {
                gap: 16px;

                div {
                    flex: 1;
                }
            }
        }

        // Invoice Work

        .invoice-work {
            .payment {
                gap: 24px;

                div {
                    flex: 1;
                }
            }

            .work-items {
                .item-list {
                    width: 100%;

                    // Item Table Styling
                    .table-heading,
                    .table-items {
                        gap: 16px;
                        font-size: 12px;

                        .item-name {
                            flex-basis: 50%;
                        }

                        .qty {
                            flex-basis: 10%;
                        }

                        .price {
                            flex-basis: 20%;
                        }

                        .total {
                            flex-basis: 20%;
                            align-self: center;
                        }
                    }

                    .table-heading {
                        margin-bottom: 16px;

                        th {
                            text-align: left;
                        }
                    }

                    .table-items {
                        position: relative;
                        margin-bottom: 24px;

                        img {
                            position: absolute;
                            top: 15px;
                            right: 0;
                            width: 12px;
                            height: 16px;
                        }
                    }
                }

                .button {
                    color: #fff;
                    background-color: #252945;
                    align-items: center;
                    justify-content: center;
                    width: 100%;

                    img {
                        margin-right: 4px;
                    }
                }
            }
        }

        .save {
            margin-top: 60px;

            div {
                flex: 1;
            }

            .right {
                justify-content: flex-end;
            }
        }
    }

    .input {
        margin-bottom: 24px;
    }

    label {
        font-size: 12px;
        margin-bottom: 6px;
    }

    input,
    select {
        width: 100%;
        background-color: #1e2139;
        color: #fff;
        border-radius: 4px;
        padding: 12px 4px;
        border: none;

        &:focus {
            outline: none;
        }
    }
}
</style>