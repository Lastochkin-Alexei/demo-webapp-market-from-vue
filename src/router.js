import { createRouter, createWebHistory } from 'vue-router'
import Index from './views/Index.vue'

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: Index,
            name: 'Index'
        },
        {
            path: '/detailed/:id?',
            component: () => import('./views/Detailed.vue'),
            name: 'Detailed'
        },
        {
            path: '/basket',
            component: () => import('./views/Basket.vue'),
            name: 'Basket'
        },
        {
            path: '/success/:id?',
            component: () => import('./views/Success.vue'),
            name: 'Success'
        }
    ]
})
