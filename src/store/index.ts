import { createStore } from 'vuex'
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore'
import FirebaseApp from '../firebase/firebaseInit'
export default createStore({
  state: {
    invoiceData: [],
    invoiceModal: false,
    modalActive: false,
    invoicesLoaded: false,
    currentInvoiceArray: [],
    editInvoice: false
  },
  mutations: {
    TOOGLE_INVOICE(state) {
      state.invoiceModal = !state.invoiceModal
    },
    TOOGLE_MODAL(state) {
      state.modalActive = !state.modalActive
    },
    SET_INVOICE_DATA(state, payload) {
      state.invoiceData.push(payload)
    },
    INVOICES_LOADED(state) {
      state.invoicesLoaded = true
    },
    SET_CURRENT_INVOICE(state, payload) {
      state.currentInvoiceArray = state.invoiceData.filter((invoice) => {
        return invoice.invoiceId === payload
      })
    },
    TOGGLE_EDIT_INVOICE(state) {
      state.editInvoice = !state.editInvoice
    },
    DELETE_INVOICE(state, payload) {
      state.invoiceData = state.invoiceData.filter((invoice) => invoice.invoiceId !== payload)
    },
    UPDATE_STATUS_TO_PAID(state, payload) {
      state.invoiceData.forEach((invoice) => {
        if (invoice.invoiceId === payload) {
          invoice.invoicePaid = true
          invoice.invoicePending = false
        }
      })
    },
    UPDATE_STATUS_TO_PENDING(state, payload) {
      state.invoiceData.forEach((invoice) => {
        if (invoice.invoiceId === payload) {
          invoice.invoicePaid = false
          invoice.invoicePending = true
          invoice.invoiceDraft = false
        }
      })
    }
  },
  actions: {
    async GET_INVOICES({ commit, state }) {
      const db = getFirestore()
      const collectionRef = collection(db, 'invoices')
      const querySnapshot = await getDocs(collectionRef)
      querySnapshot.forEach((doc) => {
        console.log('COMPARACAO', doc.id)
        if (!state.invoiceData.some((invoice) => invoice.docId === doc.id)) {
          console.log('dados do doc', doc)
          const data = {
            invoiceId: doc.id,
            billerStreetAddress: doc.data().billerStreetAddress,
            billerCity: doc.data().billerCity,
            billerZipCode: doc.data().billerZipCode,
            billerCountry: doc.data().billerCountry,
            clientName: doc.data().clientName,
            clientEmail: doc.data().clientEmail,
            clientStreetAddress: doc.data().clientStreetAddress,
            clientCity: doc.data().clientCity,
            clientZipCode: doc.data().clientZipCode,
            clientCountry: doc.data().clientCountry,
            invoiceDate: doc.data().invoiceDate,
            invoiceDateUnix: doc.data().invoiceDateUnix,
            paymentTerms: doc.data().paymentTerms,
            paymentDueDate: doc.data().paymentDueDate,
            paymentDueDateUnix: doc.data().paymentDueDateUnix,
            productDescription: doc.data().productDescription,
            invoiceItemList: doc.data().invoiceItemList,
            invoiceTotal: doc.data().invoiceTotal,
            invoicePending: doc.data().invoicePending,
            invoiceDraft: doc.data().invoiceDraft,
            invoicePaid: null
          }

          commit('SET_INVOICE_DATA', data)
        }
      })
      commit('INVOICES_LOADED')
    },
    async UPDATE_INVOICE({ commit, dispatch }, { docId, routeId }) {
      commit('DELETE_INVOICE', docId)
      await dispatch('GET_INVOICES')
      commit('TOOGLE_INVOICE')
      commit('TOGGLE_EDIT_INVOICE')
      commit('SET_CURRENT_INVOICE', routeId)
    },
    async DELETE_INVOICE({ commit }, docId) {
      const docRef = doc(FirebaseApp, 'invoices', docId)
      deleteDoc(docRef)
      commit('DELETE_INVOICE', docId)
    },
    async UPDATE_STATUS_TO_PAID({ commit }, docId) {
      const docRef = doc(FirebaseApp, 'invoices', docId)
      setDoc(docRef, { invoicePaid: true, invoicePeding: false }, { merge: true })
      commit('UPDATE_STATUS_TO_PAID')
    },
    async UPDATE_STATUS_TO_PENDING({ commit }, docId) {
      const docRef = doc(FirebaseApp, 'invoices', docId)
      setDoc(
        docRef,
        { invoicePaid: false, invoicePeding: true, invoiceDraft: false },
        { merge: true }
      )
      commit('UPDATE_STATUS_TO_PENDING', docId)
    }
  },
  modules: {}
})
