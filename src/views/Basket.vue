<script setup>

import { computed, ref, reactive } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useBasketStore } from '@/stores/Basket'
import Order from '@/components/Order.vue'
import { BackButton, MainButton, useWebAppPopup, useWebApp, useWebAppNavigation, useWebAppMainButton } from "vue-tg"

const pay_token = '381764678:TEST:57261'
const api_token = '6263470438:AAHCS7O9lSohVGfaQshvF5uHAZv3T5kSYHw'
const domain = 'tg.flybx.ru'

const { openInvoice } = useWebAppNavigation()
const { showMainButtonProgress, hideMainButtonProgress }  = useWebAppMainButton()

const { close, initDataUnsafe } = useWebApp()

const basketStore = useBasketStore()
const { showAlert } = useWebAppPopup()

const router = useRouter()
const modalVisible = ref(false)

const paymentLink = ref(null)

const goBack = () => window.history.length > 1 ? router.go(-1) : router.push({name: 'Index'})

const delivery_detailed = reactive({
    name: '',
    sity: '',
    delivery: {id: 2, title: 'Пункт выдачи', price: 0, deadlines: 'от 2 дней'},
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
        showMainButtonProgress()
        createInvoiceLink()
    }
}

const getInvoice = (id, goods, orderId) => {
    const invoice = {
        provider_token: pay_token,
        start_parametr: 'get_access',
        title: `Заказ #${orderId}`,
        photo_url: 'https://telegra.ph/file/24284792cb96ad0da2a10.png',
        photo_width: 500,
        photo_height: 500,
        description: 'IPSUM - новая линейка пищевых добавок от доктора Александра Дзидзария',
        currency: 'RUB',
        prices: goods.map((item) => ({
            label: `${item.name} х${item.count}`,
            amount: (item.price * item.count * 100).toFixed(0)
        })),
        payload: orderId
    }

    return invoice
}

const pre = ref(null)

const closeInvoice = (status) => {
    const my_order = basketStore.mySuccessBuy.find(order => order.uid_pay == pre.value)

    if (status == 'paid') {
        basketStore.setPaid(my_order.uid_pay)
        send_check_to_chat(my_order.uid_pay, my_order.orders, my_order.delivery, my_order.link, 'paid')
        basketStore.deleteAllOrders()
        showAlert(`Ваш заказ #${pre.value} успешно принят! \n\nОн будет доставлен выбранной службой доставки по указанному адресу.\n\nХорошего дня, и до новых встреч. Ваш, IPSUM!`, close)
    } else {
        send_check_to_chat(my_order.uid_pay, my_order.orders, my_order.delivery, my_order.link, 'fail')
    }
}

const createInvoiceLink = () => {
    const TOKEN = api_token
    const uid_order = Math.random().toString().slice(2).substr(0, 5)

    axios
        .post(
            `https://api.telegram.org/bot${TOKEN}/createInvoiceLink`,
            getInvoice(1, basketStore.orders, uid_order)
        )
        .then((response) => {
            paymentLink.value = response.data.result

            basketStore.addBuy({
                uid_pay: uid_order,
                orders: basketStore.orders,
                delivery: basketStore.onDelivery.delivery,
                paid: false,
                link: response.data.result
            })

            hideMainButtonProgress()
            pre.value = uid_order
            openInvoice(response.data.result, closeInvoice)
        })
        .catch((error) => {
            console.log(error)
        })
}

const finally_price = computed(() => {

    let price = 0

    basketStore.orders.forEach((i) => {
        price = price + ( i.mod.find(sku => sku.mod_sku == i.select_mod).mod_price * i.count )
    })

    let total = price

    if (basketStore.onDelivery != false) {
        total = price + basketStore.onDelivery.delivery.price
    }

    return { price, total }
})

const order_delivery = ref([
    {id: 1, title: 'Курьер', price: 399, deadlines: 'от 2 дней'},
    {id: 2, title: 'Пункт выдачи', price: 0, deadlines: 'от 2 дней'},
    {id: 3, title: 'Почта', price: 199, deadlines: 'от 2 до 4 дней'},
])

const selected_delivery = ref(false)

const send_check_to_chat = ( orderId, goods, delivery, pay_link, status ) => {
    const TOKEN = api_token

    let reply = null

    let order_list = ''
    let blkstr = []

    goods.forEach((e) => {
        blkstr.push(e.name + ' - ' + e.count + ' шт.')
    })

    order_list = blkstr.join("\n")

    let delivery_info = ''
    if ( delivery.title === 'Почта' ) {
        delivery_info = 'Мы привезем его в течении 2-4 дней службой доставки *Почта России* по указанному адресу.'
    } else if ( delivery.title === 'Курьер' ) {
        delivery_info = 'Ваш заказ будет доставлен курьером в течении 2 дней по указанному адресу.'
    } else {
        delivery_info = 'Вы можете самостоятельно забрать свой товар через 2 дня со склада IPSUM в вашем городе.'
    }

    let markup = null

    if (status == 'paid') {
        reply = `Ваш заказ #${orderId} успешно оплачен!\n\n*Состав заказа\n${order_list}*\n\n${delivery_info}\n\nСпасибо за ваш заказ!\nВаш IPSUM!`
        markup = {
                    inline_keyboard: [
                        [
                            {
                                text: `Просмотреть заказ #${orderId}`,
                                web_app: {url: `https://${domain}/success/${orderId}`}
                            }
                        ],
                        [
                            {
                                text: `Повторить заказ`,
                                url: pay_link
                            }
                        ]
                    ]
                }
    } else {
        reply = `Ваш заказ #${orderId} НЕ ОПЛАЧЕН!\n\n*Состав заказа\n${order_list}*\n\nДля перехода на оплату заказа нажмите кнопку "оплатить" под этим сообщением.\n\nВаш IPSUM!`
        markup = {
                    inline_keyboard: [
                        [
                            {
                                text: `Оплатить заказ #${orderId}`,
                                url: pay_link
                            }
                        ]
                    ]
                }
    }

    axios
        .post(
            `https://api.telegram.org/bot${TOKEN}/sendMessage`,
            {
                chat_id: initDataUnsafe.user.id,
                text: reply,
                parse_mode: 'Markdown',
                reply_markup: markup
            }
        )
        .then((res) => {
            console.log(res)
        })
        .catch((error) => {
            console.log(error)
        })
}

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
                <span><b class="font-medium">Способ доставки:</b> {{ basketStore.onDelivery.delivery.title }}</span>
                <span><b class="font-medium">Срок доставки заказа:</b> {{ basketStore.onDelivery.delivery.deadlines }}</span>
                <hr />
                <span><b class="font-medium">Контакты получателя</b></span>
                <span><b class="font-medium">Имя:</b> {{ basketStore.onDelivery.name }}</span>
                <span><b class="font-medium">Моб. телефон:</b> {{ basketStore.onDelivery.number }}</span>
                <span><b class="font-medium">Адрес:</b> {{ basketStore.onDelivery.sity }}, {{ basketStore.onDelivery.street }}, {{ basketStore.onDelivery.home }}</span>

                <a 
                    class="flex justify-center items-center bg-red-500 rounded-xl text-white font-semibold text-sm mt-2 px-5 py-2 noted"
                    @click.prevent="basketStore.setDelivery(false)"
                    href="#sertificate">
                Удалить
                </a>
            </div>

            <div class="flex flex-col gap-y-4">
                <div class="flex justify-between items-center">
                    <div class="font-semibold text-lg">Способ оплаты</div>
                    <a href="#"
                        @click="(e) => {
                            e.preventDefault()
                        }"
                    >
                        <img 
                            class=" cursor-pointer w-4"
                            src="@/assets/icons/Arrow.svg"
                            alt="Arrow-Icon-Next"
                        />
                    </a>
                </div>

                <div class="flex flex-col gap-y-3">
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
                    </div>
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
                    <b 
                    v-if="!basketStore.onDelivery"
                    class="font-semibold">0 ₽</b>
                    <b 
                    v-else
                    class="font-semibold">{{ basketStore.onDelivery.delivery.price }} ₽</b>
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