<script setup>

import { computed } from 'vue'
import { useBasketStore } from '@/stores/Basket'
import { useRoute } from 'vue-router'
import { useWebAppNavigation } from "vue-tg"

const { openInvoice } = useWebAppNavigation()

const route = useRoute()
const id = route.params.id

const basketStore = useBasketStore()

const my_order = basketStore.mySuccessBuy.find(order => order.uid_pay == id)

const finally_price = computed(() => {

    let price = 0

    my_order.orders.forEach((i) => {
        price = price + ( i.mod.find(sku => sku.mod_sku == i.select_mod).mod_price * i.count )
    })

    let total = price + my_order.delivery.price

    return { price, total }

})

const closeInvoice = (status) => {
    if (status == 'paid') {
        basketStore.setPaid(my_order.uid_pay)
    }
}

const rePay = () => {
    if (my_order.link) {
        openInvoice(my_order.link, closeInvoice)
    }
}

</script>

<template>
     <main id="container" class="p-5 max-sm:w-full w-[640px] mx-auto">

        <section id="order" class="flex flex-col gap-y-4">
            <div class="font-semibold text-lg">Заказ #{{ my_order.uid_pay }}</div>

            <div
                v-for="order in my_order.orders"
                :key="order.id"
                :to="'/detailed/' + order.id"
                class="hover:bg-slate-100 p-2 rounded-xl noted"
            >
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-x-5">
                        <img
                            class="w-16"
                            :src="order.primary_image"
                            :alt="order.name"
                        />

                        <div class="flex flex-col gap-y-2">
                            <div>
                                <strong class="font-semibold">{{ order.name }}</strong>
                                <p class="text-theme_silver_500">Упаковка ( {{ order.mod.find(sku => sku.mod_sku == order.select_mod).mod_name }} )</p>
                            </div>
                        </div>
                    </div>

                    <div class="font-semibold">
                        {{ order.count }}х
                    </div>

                    <div class="flex flex-col items-end gap-y-6">
                        <strong>{{ order.mod.find(sku => sku.mod_sku == order.select_mod).mod_price * order.count }} ₽</strong>
                    </div>
                </div>
            </div>

            <div class="flex justify-between">
                <div class="font-semibold text-lg">Всего</div>
                <div class="font-semibold text-lg">{{ finally_price.price }} ₽</div>
            </div>

            <div 
            v-if="my_order.paid"
            class="bg-green-200 text-center p-3 rounded-lg font-medium text-green-900 cursor-pointer hover:opacity-90 noted">
                Заказ успешно оплачен
            </div>

            <div 
            v-else
            class="bg-red-200 text-center p-3 rounded-lg font-medium text-red-900 cursor-pointer hover:opacity-90 noted">
                Заказ не оплачен!
            </div>

            <div class="flex flex-col gap-y-3">
                <div class="flex flex-col gap-y-3">
                    <div class="font-medium text-lg">Способ оплаты</div>

                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-x-3">
                            <div class="flex justify-center items-center bg-theme_silver_100 w-14 h-14 rounded-lg">
                                <img 
                                    src="../assets/icons/card.svg"
                                    alt="Icon Card"
                                />
                            </div>
                            <div>
                                <h4>Банковская карта</h4>
                                <span class="text-sm font-semibold text-green-500">МИР</span>
                            </div>
                        </div>

                        <a 
                        v-if="!my_order.paid"
                        class="bg-green-200 px-5 py-2 rounded-lg hover:opacity-90 noted"
                        href="#"
                        @click.prevent="rePay()"
                        >Оплатить</a>
                    </div>
                </div>

                <div class="flex flex-col gap-y-3">
                    <div class="font-medium text-lg">Способ доставки</div>

                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-x-3">
                            <div class="flex justify-center items-center bg-theme_silver_100 w-14 h-14 rounded-lg">
                                <img 
                                    src="../assets/icons/delivery_mail.svg"
                                    alt="Icon Delivery"
                                />
                            </div>
                            <div>
                                <h4>{{ my_order.delivery.title }}</h4>
                                <span class="text-sm text-theme_silver_500">{{ my_order.delivery.deadlines }}</span>
                            </div>
                        </div>

                        <span>{{ my_order.delivery.price }} ₽</span>
                    </div>
                </div>
            </div>

            <div class="flex justify-between">
                <div class="font-semibold text-xl">Итого</div>
                <div class="font-semibold text-xl">{{ finally_price.total }} ₽</div>
            </div>
        </section>

        <a href="#" @click.prevent="rePay()" class="bg-theme_purple flex justify-center py-3 rounded-lg uppercase font-semibold text-white hover:opacity-90 mt-3 noted">{{ my_order.paid ? 'Повторить заказ' : 'Оплатить заказ'}}</a>
        <a href="https://t.me/apiproru" class="flex justify-center text-sm uppercase font-medium text-theme_silver_500 hover:opacity-90 mt-4 noted">Связаться с поддержкой</a>
    </main>

</template>