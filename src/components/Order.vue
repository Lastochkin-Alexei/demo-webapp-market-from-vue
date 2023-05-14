<script setup>

import { useBasketStore } from '../stores/Basket'

const basketStore = useBasketStore()

const props = defineProps({
    order: {
        type: Object
    }
})

</script>

<template>
    <div class="border-2 rounded-2xl p-4">
        <div class="grid grid-cols-3">
            <img 
                class="w-20"
                :src="order.primary_image"
                :alt="order.name"
            />

            <div class="flex flex-col gap-y-2">
                <div>
                    <strong>{{ order.name }}</strong>
                    <p class="text-theme_silver_500">Упаковка ( {{ order.mod.find(sku => sku.mod_sku == order.select_mod).mod_name }} )</p>
                </div>

                <div class="flex gap-x-4 items-center">
                    <span
                    class="noted"
                    @click="basketStore.setCount(order.uid, 'decrement')"
                    >
                        <img 
                            class="w-4 cursor-pointer"
                            src="@/assets/icons/Arrow.svg"
                            alt="Arrow-Icon-Decrement"
                        />
                    </span>
                    <strong>{{ order.count }}</strong>
                    <span
                    class="noted"
                    @click="basketStore.setCount(order.uid, 'increment')"
                    >
                        <img 
                            class="rotate-180 cursor-pointer w-4"
                            src="@/assets/icons/Arrow.svg"
                            alt="Arrow-Icon-Increment"
                        />
                    </span>
                </div>
            </div>

            <div class="flex flex-col items-end gap-y-6">
                <strong>{{ order.mod.find(sku => sku.mod_sku == order.select_mod).mod_price * order.count }} ₽</strong>
                <span
                class="noted"
                @click="basketStore.deleteOrder(order.uid)"
                >
                    <img 
                        class="cursor-pointer w-6"
                        src="@/assets/icons/Delete.svg"
                        alt="Delete-Icon"
                    />
                </span>
            </div>
        </div>
    </div>
</template>