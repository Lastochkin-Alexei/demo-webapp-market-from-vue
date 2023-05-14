<script setup>

import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/Orders'
import { MainButton, BackButton, useWebAppPopup } from "vue-tg"

const router = useRouter()
const route = useRoute()

const ordersStore = useOrdersStore()

const { showAlert } = useWebAppPopup()
const id = route.params.id

const goBack = () => router.push({name: 'Index'})
const goBasket = () => router.push({name: 'Basket'})

const sertificate_opened = ref(null)
const product = ordersStore.orders.find(product => product.id == id)
const pack = ref(product.price == 0 ? null : product.mod[0].mod_sku)

const setPack = (sku) => {
    pack.value === sku
        ? pack.value = null
        : pack.value = sku
}

const pushAlert = () => {
    if (window.Telegram.WebApp.ready() != undefined) {
        showAlert('Товар добавлен в корзину')
    } else {
        alert('Товар добавлен в корзину')
    }
}

</script>

<template>
    <main id="container" class="p-5 max-sm:w-full w-[640px] mx-auto">

        <BackButton @click="goBack()"/>

        <MainButton 
            text="Корзина"
            @click="goBasket()" 
            color="#B66CF5"
        />

        <section id="detailed" class="flex flex-col gap-y-3">
            
            <div
                v-if="sertificate_opened === null" 
                class="flex flex-col gap-y-3"
            >

                <div class="flex justify-center py-4 relative">
                    <img
                        class="w-64"
                        :src="product.primary_image"
                        :alt="product.name"
                    />

                        <div class="flex flex-col gap-y-2 absolute top-0 right-0">
                            <span
                                v-for="tag in product.tags"
                                :key="tag"
                            >
                                <span
                                    v-for="detail in ordersStore.tags"
                                    :key="detail.id"
                                >
                                    <img
                                        v-if="detail.id === tag"
                                        :src="detail.image"
                                        :alt="detail.name"
                                    />
                                </span>
                            </span>
                        </div>
                </div>

                <div class="flex justify-between">
                    <div>
                    <p class="text-sm text-theme_silver_500">{{ product.name_description }}</p>
                    <h2 class="text-xl font-semibold text-theme_black uppercase">{{ product.name }}</h2>
                    </div>

                    <div>
                    <p class="text-sm text-theme_silver_500">Цена</p>
                    <h2 class="text-xl font-semibold text-theme_black uppercase">
                        <span v-if="pack === null" >{{ product.price }} ₽</span>
                        <span v-else>{{ product.mod.find(sku => sku.mod_sku == pack).mod_price }} ₽</span>
                    </h2>
                    </div>
                </div>

                <div class="flex flex-col gap-y-2">
                    <div class="font-semibold text-lg">Упаковка</div>
                    <div class="flex flex-row gap-3 overflow-x-auto">
                        <span 
                            v-for="mod in product.mod"
                            :key="mod.mod_sku"
                            @click="setPack(mod.mod_sku)"
                            :class="{'bg-theme_yellow': mod.mod_sku === pack}"
                            class="flex w-16 h-16 bg-theme_silver_100 justify-center items-center rounded-xl cursor-pointer transition-all text-sm font-semibold text-theme_black noted">
                                {{ mod.mod_name }}
                        </span>
                    </div>
                </div>

            </div>

            <div
                v-else
                class="relative"
            >
                <img 
                    :src="sertificate_opened"
                    alt="sertificate"
                />

                <a 
                    class="flex justify-center items-center bg-red-500 rounded-full w-6 h-6 absolute -right-3 -top-3 noted"
                    @click="sertificate_opened = null"
                    href="#sertificate"
                >
                    <img 
                        class="w-3"
                        src="@/assets/icons/Х.svg"
                        alt="Icon-Close"
                    />
                </a>
            </div>

            <a 
                @click.prevent="() => {
                    ordersStore.addOrder(product, pack)
                    pushAlert()
                }"
                v-if="product.price > 0 && pack !== null"
                class="flex text-md font-semibold bg-theme_purple text-white p-2.5 justify-center rounded-xl hover:bg-purple-500 transition-all noted"
                href="#"
            >Купить</a>

            <div 
                v-else-if="product.price > 0 && pack === null"
                class="flex text-md font-semibold bg-theme_silver_200 text-theme_black p-2.5 justify-center rounded-xl"
            >Упаковка не выбрана</div>

            <div 
                v-else
                class="flex text-md font-semibold bg-theme_silver_200 text-theme_black p-2.5 justify-center rounded-xl"
            >Скоро</div>

            <div>
                <div class="font-semibold text-lg">Описание</div>
                <p class="text-md text-theme_black">{{ product.description[0].content }}</p>
            </div>

            <div>
                <div class="font-semibold text-lg">Рекомендации</div>
                <p class="text-md text-theme_black">{{ product.description[1].content }}</p>
            </div>

            <div>
                <div class="font-semibold text-lg">Состав</div>
                <p class="text-md text-theme_black">{{ product.description[2].content }}</p>
            </div>

            <div>
                <div class="font-semibold text-lg" id="sertificate">Сертификат</div>
                <div class="grid grid-cols-2 gap-2">
                    <a href="#container"
                        class="noted"
                        v-for="certificate in product.description[3].content"
                        @click="sertificate_opened = certificate"
                    >
                        <img
                            :src="certificate"
                            alt="Certificate"
                        />
                    </a>
                </div>
            </div>

        </section>
    </main>
</template>