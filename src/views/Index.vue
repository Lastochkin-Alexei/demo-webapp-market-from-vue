<script setup>

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/Orders'
import { MainButton } from "vue-tg"

const router = useRouter()
const ordersStore = useOrdersStore()

const query = ref('')
const queryTags = ref([])

const queryResults = computed(() => {
    let defaultSort = ordersStore.orders.sort((a, b) => {
        if (b.price === 0) return -1
    })

    if (queryTags.value.length > 0 && query.value.length < 1) {
        return defaultSort.filter((product) => product.tags.some(tag => queryTags.value.includes(tag)) === true)
    } else {
        return defaultSort.filter((product) => product.name.toLowerCase().indexOf(query.value.toLowerCase()) !== -1)
    }
})

const goBasket = () => router.push({name: 'Basket'})

const setTags = (tag) => {
    if (queryTags.value.find(selectedTag => selectedTag == tag)) {
        queryTags.value = queryTags.value.filter((selectedTag) => selectedTag !== tag)
    } else {
        queryTags.value.push(tag)
    }
}

const inTags = (tag) => {
    if (queryTags.value.includes(tag)) {
        return true
    }
}
    
</script>

<template>
    <main id="container" class="p-5 max-sm:w-full w-[640px] mx-auto">

        <MainButton
            text="Корзина"
            @click="goBasket()" 
            color="#B66CF5"
        />

        <header class="flex flex-col gap-y-4">

        <div class="flex bg-theme_silver_100 items-center rounded-xl pl-4">
            <img 
                src="@/assets/icons/Search.svg"
                alt="Search-Icon"
            />

            <input
                @keyup.enter="(e) => e.target.blur()"
                v-model="query"
                class="bg-theme_silver_100 p-3 text-base text-theme_black w-full rounded-r-xl outline-none noted"
                type="text"
                placeholder="Поиск..."
            />
        </div>

        <div id="filters" class="flex gap-4 overflow-x-auto no-scrollbar">
            <span 
                v-for="tag in ordersStore.tags"
                :key="tag.id"
                @click="setTags(tag.id)"
                :class="{'!border-theme_purple' : inTags(tag.id)}"
                class="flex justify-center items-center bg-theme_silver_100 rounded-xl p-2 cursor-pointer hover:opacity-60 transition-all border-2 border-theme_silver_100 noted">
                    <span class="flex justify-center items-center bg-theme_white rounded-xl p-1">
                        <img 
                            class="w-8 max-w-xs"
                            :src="tag.image"
                            :alt="tag.id"
                        />
                    </span>
            </span>
        </div>

        </header>

        <section id="list" class="grid grid-cols-2 py-6 gap-y-3">
            <router-link
                v-for="product in queryResults"
                :key="product.id"
                :to="'/detailed/' + product.id" :class="{'opacity-50': product.price < 1}" class="flex flex-col items-center px-4 gap-y-1 scale-90 hover:scale-100 transition-all noted">
                <img
                :src="product.primary_image"
                :alt="product.name"
                class="mb-2"
                />

                <span class="flex justify-center gap-x-1">
                    <span
                        v-for="tag in product.tags"
                        :key="tag.id"
                    >
                        <span
                            v-for="detail in ordersStore.tags"
                            :key="detail.id"
                        >
                            <img
                                :class="{'!border-theme_purple' : inTags(tag)}"
                                v-if="detail.id === tag"
                                class="w-8 rounded-md border-2 border-theme_white"
                                :src="detail.image"
                                :alt="detail.name"
                            />
                        </span>
                    </span>
                </span>

                <p class="font-medium text-sm text-theme_black uppercase">{{ product.name }}</p>
                <span class="font-bold text-lg text-theme_black uppercase">{{ product.price }} ₽</span>
            </router-link>
        </section>
    </main>
</template>