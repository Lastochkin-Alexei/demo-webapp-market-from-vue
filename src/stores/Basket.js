import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useBasketStore = defineStore('basketStore', () => {

    const orders = ref([])
    const ordersInLocalStorage = localStorage.getItem("orders")
    if (ordersInLocalStorage) orders.value = JSON.parse(ordersInLocalStorage)._value

    const mySuccessBuy = ref([])
    const mySuccessBuyInLocalStorage = localStorage.getItem("buys")
    if (mySuccessBuyInLocalStorage) mySuccessBuy.value = JSON.parse(mySuccessBuyInLocalStorage)._value

    const onDelivery = ref(false)
    const deliveryInLocalStorage = localStorage.getItem("delivery")
    if (deliveryInLocalStorage) onDelivery.value = JSON.parse(deliveryInLocalStorage)._value

    const addBuy = (obj) => mySuccessBuy.value.push(obj)
    const deleteAllOrders = () => orders.value = []
    const deleteOrder = (id) => orders.value = orders.value.filter(el => el.uid !== id)
    const setDelivery = (obj) => onDelivery.value = obj

    const setCount = (uid, mode) => {
        const idx = orders.value.findIndex((el) => el.uid === uid)
        if (mode == 'increment') {
            if (orders.value[idx].count < 10) {
                orders.value[idx].count++
            }
        }

        if (mode == 'decrement') {
            if (orders.value[idx].count > 1) {
                orders.value[idx].count--
            }
        }
    }

    const setPaid = (uid) => {
        const idx = mySuccessBuy.value.findIndex((el) => el.uid_pay === uid)
        mySuccessBuy.value[idx].paid = true
    }

    watch(() => orders, (state) => {
        localStorage.setItem("orders", JSON.stringify(state))
    }, {deep: true})

    watch(() => mySuccessBuy, (state) => {
        localStorage.setItem("buys", JSON.stringify(state))
    }, {deep: true})

    watch(() => onDelivery, (state) => {
        localStorage.setItem("delivery", JSON.stringify(state))
    }, {deep: true})

    return {
        orders,
        deleteAllOrders,
        onDelivery,
        setDelivery,
        deleteOrder,
        setCount,
        mySuccessBuy,
        addBuy,
        setPaid
    }
})