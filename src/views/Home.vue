<template>
  <div class="home container">
    <!-- Header -->
    <div class="header flex">
      <div class="left flex flex-column">
        <h1>Faturas</h1>
        <span>Existem {{ invoiceData.length }} fatura no total</span>
      </div>
      <div class="right flex">
        <div @click="toogleFilterMenu" class="filter flex">
          <span>Filtrar por Status <span v-if="filteredInvoice">{{ filteredInvoice }}</span></span>
          <img src="@/assets/icon-arrow-down.svg" alt="">
          <ul v-show="filterMenu" class="filter-menu">
            <li @click="filteredInvoices">Rascunho</li>
            <li @click="filteredInvoices">Pendente</li>
            <li @click="filteredInvoices">Pago</li>
            <li @click="filteredInvoices">Limpar Filtro</li>
          </ul>
        </div>
        <div @click="newInvoice" class="button flex">
          <div class="inner-button">
            <img src="@/assets/icon-plus.svg" alt="">
          </div>
          <span>Nova Fatura</span>
        </div>
      </div>
    </div>
    <!-- Invoices -->
    <div v-if="invoiceData.length > 0">
      <Invoice v-for="(invoice, index) in filteredData" :invoice="invoice" :key="index" />
    </div>
    <div v-else class="empty flex flex-column">
      <img src="@/assets/illustration-empty.svg" alt="">
      <h3>Não há nada aqui</h3>
      <p>Crie uma nova fatura clicando no botao de Nova Fatura e inicie a listagem</p>
    </div>
  </div>
</template>

<script>
import Invoice from '../components/Invoice.vue'
import { mapMutations, mapState } from 'vuex';
export default {
  name: "Home",
  data() {
    return {
      filterMenu: null,
      filteredInvoice: null,
    }
  },
  components: {
    Invoice,
  },
  methods: {
    ...mapMutations(["TOOGLE_INVOICE"]),
    newInvoice() {
      this.TOOGLE_INVOICE()
    },
    toogleFilterMenu() {
      this.filterMenu = !this.filterMenu
    },
    filteredInvoices(e) {
      if (e.target.innerText === "Clear Filter") {
        this.filteredInvoice = null;
        return;
      }
      this.filteredInvoice = e.target.innerText;
    },

  },
  computed: {
    ...mapState(["invoiceData"]),
    filteredData() {
      return this.invoiceData.filter((invoice) => {
        if (this.filteredInvoice === "Draft") {
          return invoice.invoiceDraft === true;
        }
        if (this.filteredInvoice === "Pending") {
          return invoice.invoicePending === true;
        }
        if (this.filteredInvoice === "Paid") {
          return invoice.invoicePaid === true;
        }
        return invoice;
      });
    },
  }
};
</script>


<style lang="scss" scoped>
.home {
  color: #fff;

  .header {
    margin-bottom: 65px;

    .left,
    .right {
      flex: 1;
    }

    .left {
      h1 {
        font-weight: bolder;
      }
    }

    .right {
      justify-content: flex-end;
      align-items: center;

      .button,
      .filter {
        align-items: center;

        span {
          font-size: 12px;
        }
      }

      .filter {
        position: relative;
        margin-right: 40px;
        cursor: pointer;

        img {
          margin-left: 12px;
          width: 9px;
          height: 5px;
        }

        .filter-menu {
          cursor: pointer;
          width: 120px;
          position: absolute;
          top: 25px;
          list-style: none;
          background-color: #1e2139;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 0px;

          li {
            cursor: pointer;
            font-size: 12px;
            padding: 10px 20px;

            &:hover {
              color: #1e2139;
              background-color: #fff;
            }
          }
        }
      }

      .button {
        padding: 8px 10px;
        background-color: #7c5dfa;
        border-radius: 40px;

        .inner-button {
          margin-right: 8px;
          border-radius: 50%;
          padding: 2px 8px 2px 8px;
          align-items: center;
          justify-content: center;
          background-color: #fff;

          img {
            width: 10px;
            height: 10px;
          }
        }
      }
    }
  }

  .empty {
    margin-top: 160px;
    align-items: center;

    img {
      width: 214px;
      height: 200px;
    }

    h3 {
      font-size: 20px;
      margin-top: 40px;
    }

    p {
      text-align: center;
      max-width: 224px;
      font-size: 12px;
      font-weight: 300;
      margin-top: 16px;
    }
  }
}
</style>