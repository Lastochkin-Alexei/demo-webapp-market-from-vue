import { defineStore } from "pinia"
import products from '@/json/products.json'
import tags from '@/json/tags.json'
import { useBasketStore } from './Basket'

export const useOrdersStore = defineStore('ordersStore', {
    state: () => ({
        orders: products.products,
        tags: tags.tags
    }),
    actions: {
        addOrder(obj, mod) {
            const basketStore = useBasketStore()
            const product = basketStore.orders.find(sku => sku.id == obj.id && sku.select_mod == mod)

            console.log(product)

            if (product) {
                basketStore.setCount(product.uid, 'increment')
            } else {
                basketStore.orders.push({uid: Math.random().toString(16).slice(2), ...obj, count: 1, select_mod: mod})
            }
        }
    }
})