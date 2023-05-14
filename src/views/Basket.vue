<script setup>

import { computed, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useBasketStore } from '@/stores/Basket'
import Order from '@/components/Order.vue'
import { BackButton, MainButton, useWebAppPopup, useWebApp } from "vue-tg"

const { close } = useWebApp()

const basketStore = useBasketStore()
const { showAlert } = useWebAppPopup()

const router = useRouter()
const modalVisible = ref(false)

const goBack = () => window.history.length > 1 ? router.go(-1) : router.push({name: 'Index'})

const delivery_detailed = reactive({
    name: '',
    sity: '',
    delivery: {id: 2, title: 'Пункт выдачи', price: 0, deadlines: 'в течении 3 дней'},
    number: '',
    street: '',
    home: ''
})

const valid = () => {
    if (delivery_detailed.name == '' || delivery_detailed.sity == '' || delivery_detailed.number == '' || delivery_detailed.street == '' || delivery_detailed.home == '') {
        window.Telegram.WebApp.ready() != undefined
            ? showAlert('Все поля должны быть заполнены!')
            : alert('Все поля должны быть заполнены!')
    } else {
        basketStore.setDelivery(delivery_detailed)
        modalVisible.value = false
    }
}

const pay = () => {
    if (basketStore.orders.length < 1) {
        showAlert('Ваш заказ не содержит товаров!')
    } else if (!basketStore.onDelivery) {
        showAlert('Укажите способ доставки!')
    } else {
        basketStore.addBuy({
            uid: Math.random().toString(16).slice(2)
        })

        showAlert('Ваш заказ # ' + (basketStore.mySuccessBuy.length) + ' упешно принят!\n\nОн будет доставлен выбранной службой доставки по указанному адресу.\n\nХорошего дня и до новых встреч!\n\nВаш, IPSUM!', () => {
            basketStore.deleteAllOrders()
            close()
        })
    }
}

const finally_price = computed(() => {

    let price = 0

    basketStore.orders.forEach((i) => {
        price = price + ( i.mod.find(sku => sku.mod_sku == i.select_mod).mod_price * i.count )
    })

    let total = price + delivery_detailed.delivery.price

    return { price, total }
})

const order_delivery = ref([
    {id: 1, title: 'Курьер', price: 200, deadlines: 'в течении 3 дней'},
    {id: 2, title: 'Пункт выдачи', price: 0, deadlines: 'в течении 3 дней'},
    {id: 3, title: 'Почта', price: 100, deadlines: 'в течении 7 дней'},
])

const selected_delivery = ref(false)

</script>

<template>

     <main id="container" class="p-5 max-sm:w-full w-[640px] mx-auto">

        <BackButton @click="goBack()"/>

        <MainButton 
            text="Перейти к оплате"
            @click="() => pay()"
        />

        <section id="order" class="flex flex-col gap-y-4">
            <div class="font-semibold text-lg">Ваш заказ</div>

            <Order
                v-for="order in basketStore.orders"
                :order="order"
                :key="order.id"
            />

            <div>
                <a 
                    @click.prevent="() => modalVisible = true"
                    class="flex justify-center bg-theme_silver_200 rounded-xl py-2 uppercase text-sm font-medium noted"
                    href="#">
                <span v-if="!basketStore.onDelivery">Выбрать способ доставки</span>
                <span v-else>Изменить способ доставки</span>
                </a>
            </div>

            <div v-if="!basketStore.onDelivery">
                Способ доставки не выбран
            </div>

            <div v-else class="flex flex-col bg-theme_silver_100 px-5 py-3 rounded-xl gap-y-1 relative">
                <span><b>Способ доставки:</b> {{ basketStore.onDelivery.delivery.title }}</span>
                <span><b>Срок доставки заказа:</b> {{ basketStore.onDelivery.delivery.deadlines }}</span>
                <hr />
                <span><b>Контакты получателя</b></span>
                <span><b>Имя:</b> {{ basketStore.onDelivery.name }}</span>
                <span><b>Моб. телефон:</b> {{ basketStore.onDelivery.number }}</span>
                <span><b>Адрес:</b> {{ basketStore.onDelivery.sity }}, {{ basketStore.onDelivery.street }}, {{ basketStore.onDelivery.home }}</span>

                <a 
                    class="flex justify-center items-center bg-red-500 rounded-xl text-white font-semibold text-sm mt-2 px-5 py-2 noted"
                    @click.prevent="basketStore.setDelivery(false)"
                    href="#sertificate">
                Удалить
                </a>
            </div>

            <div>
                <div class="flex justify-between items-center">
                    <div class="font-semibold text-lg">Способ оплаты</div>
                    <a href="#"
                        @click="(e) => {
                            e.preventDefault()
                        }"
                    >
                        <img 
                            class="-rotate-90 cursor-pointer w-4"
                            src="@/assets/icons/Arrow.svg"
                            alt="Arrow-Icon-Next"
                        />
                    </a>
                </div>
            </div>

            <div class="flex flex-col gap-y-2">
                <div class="font-semibold text-lg">Информация по заказу</div>
                <div class="flex justify-between">
                    <p class="text-theme_silver_500">Итого</p>
                    <b class="font-semibold">{{ finally_price.price }} ₽</b>
                </div>

                <div class="flex justify-between">
                    <p class="text-theme_silver_500">Способ доставки</p>
                    <b class="font-semibold">{{ delivery_detailed.delivery.price }} ₽</b>
                </div>

                <div class="flex justify-between">
                    <p class="text-theme_silver_500">Всего</p>
                    <b class="font-semibold">{{ finally_price.total }} ₽</b>
                </div>
            </div>
        </section>

        <div 
            v-if="modalVisible"
            class="absolute top-0 right-0 left-0 bottom-0 flex justify-center py-5 max-sm:w-full w-[640px] mx-auto">

            <div
                class="flex flex-col bg-white p-5 rounded-xl gap-y-3 w-11/12 relative h-fit shadow-xl" 
            >

                <a 
                    class="flex justify-center items-center bg-red-500 rounded-full w-6 h-6 absolute -right-3 -top-3 noted"
                    @click.prevent="modalVisible = false"
                    href="#sertificate">
                <img 
                    class="w-3"
                    src="@/assets/icons/Х.svg"
                    alt="Icon-Close"
                />
                </a>

                <h2
                    class="text-xl font-semibold"
                >Информация о доставке</h2>

                <hr />

                <div class="flex flex-col gap-y-2">
                    <span>ФИО</span>
                    <input 
                        @keyup.enter="(e) => e.target.blur()"
                        type="text"
                        class="px-5 py-3 bg-theme_silver_100 rounded-xl outline-none noted"
                        placeholder="Введите ваше ФИО"
                        v-model="delivery_detailed.name"
                    />
                </div>

                <div class="flex flex-col gap-y-2">
                    <span>Ваш город</span>
                    <input 
                        @keyup.enter="(e) => e.target.blur()"
                        type="text"
                        class="px-5 py-3 bg-theme_silver_100 rounded-xl outline-none noted"
                        placeholder="Введите город доставки"
                        v-model="delivery_detailed.sity"
                    />
                </div>

                <div class="flex flex-col gap-y-2 relative">
                    <span>Способ доставки</span>

                    <div 
                        @click="selected_delivery = !selected_delivery"
                        class="flex justify-between items-center px-5 py-3 bg-theme_silver_100 rounded-xl noted hover:cursor-pointer">
                        <span class="text-theme_black">{{ delivery_detailed.delivery.title }}</span>
                        <img 
                            src="@/assets/icons/Arrow.svg"
                            alt="Icon-Arrow"
                        />
                    </div>

                    <div 
                        v-if="selected_delivery"
                        class="absolute top-24 w-full flex flex-col gap-y-1 bg-theme_white hover:cursor-pointer">
                        
                        <div 
                            v-for="select in order_delivery"
                            :key="select.id"
                            @click="() => {
                                delivery_detailed.delivery = select
                                selected_delivery = false
                            }"
                            class="flex flex-col px-5 py-3 gap-y-1 bg-theme_silver_100 rounded-xl shadow-xl">
                            <span 
                                :class="{'!text-theme_black' : select.id === delivery_detailed.delivery.id}"
                                class="text-theme_silver_500">{{ select.title }}</span>
                        </div>
                    </div>
                    
                </div>

                <div class="flex flex-col gap-y-2">
                    <span>Телефон</span>
                    <input 
                        @keyup.enter="(e) => e.target.blur()"
                        type="text"
                        class="px-5 py-3 bg-theme_silver_100 rounded-xl outline-none noted"
                        placeholder="+7"
                        v-model="delivery_detailed.number"
                    />
                </div>

                <div class="grid grid-cols-2 gap-x-2">
                    <div class="flex flex-col gap-y-2">
                        <span>Улица</span>
                        <input 
                            @keyup.enter="(e) => e.target.blur()"
                            type="text"
                            class="px-5 py-3 bg-theme_silver_100 rounded-xl outline-none w-full noted"
                            placeholder="Не указана"
                            v-model="delivery_detailed.street"
                        />
                    </div>

                    <div class="flex flex-col gap-y-2">
                        <span>Дом</span>
                        <input 
                            @keyup.enter="(e) => e.target.blur()"
                            type="text"
                            class="px-5 py-3 bg-theme_silver_100 rounded-xl outline-none w-full noted"
                            placeholder="Не указан"
                            v-model="delivery_detailed.home"
                        />
                    </div>
                </div>

                <a href="#"
                    class="rounded-xl px-5 py-3 text-center font-semibold text-white bg-green-400 mt-3 noted"
                    @click.prevent="() => {
                        valid()
                    }"
                >
                    Добавить
                </a>
            </div>
        </div>
    </main>

</template>

<style>

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease
}

.fade-enter-from, .fade-leave-to {
    opacity: 0
}

</style>